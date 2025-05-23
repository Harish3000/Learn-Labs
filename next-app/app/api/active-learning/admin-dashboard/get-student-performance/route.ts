import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  console.log("GET request received for student performance data");

  const supabase = await createClient();

  // Fetch performance records
  const { data: performanceData, error: perfError } = await supabase
    .from("performance_records")
    .select(
      "record_id, student_id, lecture_id, question_id, displayed_difficulty, attempts, time_taken, final_result, timestamp"
    )
    .order("timestamp", { ascending: true });

  if (perfError) {
    console.error(
      "Supabase query error for performance_records:",
      perfError.message
    );
    return NextResponse.json(
      { error: "Failed to fetch performance data" },
      { status: 500 }
    );
  }

  console.log(
    "Performance records fetched successfully, count:",
    performanceData.length
  );

  // Fetch related questions data
  const questionIds: number[] = Array.from(
    new Set(performanceData.map((record) => record.question_id))
  );
  const { data: questionsData, error: questionsError } = await supabase
    .from("questions")
    .select("question_id, difficulty, question")
    .in("question_id", questionIds);

  if (questionsError) {
    console.error(
      "Supabase query error for questions:",
      questionsError.message
    );
    return NextResponse.json(
      { error: "Failed to fetch questions data" },
      { status: 500 }
    );
  }

  // Fetch related lectures data
  const lectureIds: number[] = Array.from(
    new Set(performanceData.map((record) => record.lecture_id))
  );
  const { data: lecturesData, error: lecturesError } = await supabase
    .from("lectures")
    .select("lecture_id, lecture_title")
    .in("lecture_id", lectureIds);

  if (lecturesError) {
    console.error("Supabase query error for lectures:", lecturesError.message);
    return NextResponse.json(
      { error: "Failed to fetch lectures data" },
      { status: 500 }
    );
  }

  // Map questions and lectures data
  const difficultyMap: { [key: string]: string } = {
    "1": "Easy",
    "2": "Medium",
    "3": "Hard",
  };
  const questionsMap = new Map<
    number,
    { difficulty: string; question: string }
  >(
    questionsData.map((q) => [
      q.question_id,
      {
        difficulty: difficultyMap[q.difficulty] || "Medium",
        question: q.question,
      },
    ])
  );
  const lecturesMap = new Map<number, string>(
    lecturesData.map((l) => [l.lecture_id, l.lecture_title])
  );

  const records = performanceData.map((record) => ({
    record_id: record.record_id as number,
    student_id: record.student_id as string,
    lecture_id: record.lecture_id as number,
    question_id: record.question_id as number,
    displayed_difficulty: record.displayed_difficulty as string,
    attempts: record.attempts as number,
    time_taken: record.time_taken as number,
    final_result: record.final_result as boolean,
    timestamp: record.timestamp as string,
    actual_difficulty:
      questionsMap.get(record.question_id)?.difficulty || "Medium",
    question_text:
      questionsMap.get(record.question_id)?.question || "Unknown Question",
    lecture_title:
      lecturesMap.get(record.lecture_id) || `Lecture ${record.lecture_id}`,
  }));

  // Calculate ELO scores
  console.log("Starting ELO score calculation");
  const studentElo: { [key: string]: number } = {};
  const questionElo: { [key: string]: number } = {
    Easy: 1000,
    Medium: 1200,
    Hard: 1400,
  };
  const K = 32;

  records.forEach((record) => {
    const student = record.student_id;
    const difficulty = record.actual_difficulty;
    if (!studentElo[student]) studentElo[student] = 1200;
    const S_elo = studentElo[student];
    const Q_elo = questionElo[difficulty] || 1200;
    const E_s = 1 / (1 + Math.pow(10, (Q_elo - S_elo) / 400));
    const A = record.final_result ? 1 : 0;
    studentElo[student] = S_elo + K * (A - E_s);
  });

  const eloScores = Object.entries(studentElo).map(([student_id, elo]) => ({
    student_id,
    elo: Math.round(elo),
  }));

  // Performance over time (for Area Chart)
  const performanceOverTimeMap: {
    [date: string]: { total: number; correct: number };
  } = {};
  records.forEach((record) => {
    const date = new Date(record.timestamp).toISOString().split("T")[0];
    if (!performanceOverTimeMap[date])
      performanceOverTimeMap[date] = { total: 0, correct: 0 };
    performanceOverTimeMap[date].total += 1;
    if (record.final_result) performanceOverTimeMap[date].correct += 1;
  });
  const performanceOverTime = Object.entries(performanceOverTimeMap).map(
    ([date, { total, correct }]) => ({
      date,
      averageCorrect: total > 0 ? correct / total : 0,
    })
  );

  // Student ELO Details (List)
  const studentStats: {
    [student_id: string]: {
      totalAttempted: number;
      correct: number;
      attemptsSum: number;
      timeTakenSum: number;
    };
  } = {};
  records.forEach((record) => {
    if (!studentStats[record.student_id]) {
      studentStats[record.student_id] = {
        totalAttempted: 0,
        correct: 0,
        attemptsSum: 0,
        timeTakenSum: 0,
      };
    }
    studentStats[record.student_id].totalAttempted += 1;
    if (record.final_result) studentStats[record.student_id].correct += 1;
    studentStats[record.student_id].attemptsSum += record.attempts;
    studentStats[record.student_id].timeTakenSum += record.time_taken;
  });
  const studentEloDetails = Object.entries(studentStats).map(
    ([student_id, stats]) => ({
      student_id,
      totalAttempted: stats.totalAttempted,
      percentageCorrect:
        stats.totalAttempted > 0
          ? (stats.correct / stats.totalAttempted) * 100
          : 0,
      averageAttempts:
        stats.totalAttempted > 0 ? stats.attemptsSum / stats.totalAttempted : 0,
      averageTimeTaken:
        stats.totalAttempted > 0
          ? stats.timeTakenSum / stats.totalAttempted
          : 0,
      elo: studentElo[student_id],
    })
  );

  // Top Performing (Hardest) Questions (List)
  const questionStats: {
    [question_id: number]: {
      total: number;
      correct: number;
      attemptsSum: number;
      timeSum: number;
      question: string;
    };
  } = {};
  records.forEach((record) => {
    if (!questionStats[record.question_id]) {
      questionStats[record.question_id] = {
        total: 0,
        correct: 0,
        attemptsSum: 0,
        timeSum: 0,
        question: record.question_text,
      };
    }
    questionStats[record.question_id].total += 1;
    if (record.final_result) questionStats[record.question_id].correct += 1;
    questionStats[record.question_id].attemptsSum += record.attempts;
    questionStats[record.question_id].timeSum += record.time_taken;
  });
  const hardestQuestions = Object.entries(questionStats)
    .map(([question_id, stats]) => ({
      question_id: parseInt(question_id),
      question: stats.question,
      avgAttempts: stats.total > 0 ? stats.attemptsSum / stats.total : 0,
      avgTimeTaken: stats.total > 0 ? stats.timeSum / stats.total : 0,
      successRate: stats.total > 0 ? stats.correct / stats.total : 0,
      difficultyScore:
        stats.total > 0
          ? (stats.attemptsSum / stats.total) * (stats.timeSum / stats.total)
          : 0,
    }))
    .sort((a, b) => b.difficultyScore - a.difficultyScore)
    .slice(0, 5);

  // Student Performance on Hardest Questions (List)
  const hardestQuestionIds = hardestQuestions.map((q) => q.question_id);
  const studentHardestPerformance = records
    .filter((record) => hardestQuestionIds.includes(record.question_id))
    .map((record) => ({
      student_id: record.student_id,
      question_id: record.question_id,
      question_text: record.question_text,
      attempts: record.attempts,
      time_taken: record.time_taken,
      final_result: record.final_result,
    }));

  // Average Correct by Lecture (Bar Chart)
  const lectureStats: {
    [lecture_id: number]: {
      total: number;
      correct: number;
      lecture_title: string;
    };
  } = {};
  records.forEach((record) => {
    if (!lectureStats[record.lecture_id]) {
      lectureStats[record.lecture_id] = {
        total: 0,
        correct: 0,
        lecture_title: record.lecture_title,
      };
    }
    lectureStats[record.lecture_id].total += 1;
    if (record.final_result) lectureStats[record.lecture_id].correct += 1;
  });
  const lecturePerformance = Object.entries(lectureStats).map(
    ([lecture_id, { total, correct, lecture_title }]) => ({
      lecture_id: parseInt(lecture_id),
      lecture_title,
      averageCorrect: total > 0 ? correct / total : 0,
    })
  );

  // Most Active Students by Lecture (List)
  const activeStudentsByLecture: {
    [key: string]: { total: number; correct: number };
  } = {};
  records.forEach((record) => {
    const key = `${record.student_id}-${record.lecture_id}`;
    if (!activeStudentsByLecture[key]) {
      activeStudentsByLecture[key] = { total: 0, correct: 0 };
    }
    activeStudentsByLecture[key].total += 1;
    if (record.final_result) activeStudentsByLecture[key].correct += 1;
  });
  const mostActiveStudents = Object.entries(activeStudentsByLecture)
    .map(([key, { total, correct }]) => {
      const [student_id, lecture_id] = key.split("-");
      return {
        student_id,
        lecture_id: parseInt(lecture_id),
        lecture_title:
          lecturesMap.get(parseInt(lecture_id)) || `Lecture ${lecture_id}`,
        totalAttempts: total,
        totalCorrect: correct,
        correctPercentage: total > 0 ? (correct / total) * 100 : 0,
      };
    })
    .sort((a, b) => b.totalAttempts - a.totalAttempts)
    .slice(0, 10);

  // Questions with Most Variability (List)
  const questionTimeStats: {
    [question_id: number]: {
      times: number[];
      total: number;
      attemptsSum: number;
      question: string;
    };
  } = {};
  records.forEach((record) => {
    if (!questionTimeStats[record.question_id]) {
      questionTimeStats[record.question_id] = {
        times: [],
        total: 0,
        attemptsSum: 0,
        question: record.question_text,
      };
    }
    questionTimeStats[record.question_id].times.push(record.time_taken);
    questionTimeStats[record.question_id].total += 1;
    questionTimeStats[record.question_id].attemptsSum += record.attempts;
  });
  const variabilityQuestions = Object.entries(questionTimeStats)
    .map(([question_id, { times, total, attemptsSum, question }]) => {
      const mean = times.reduce((a, b) => a + b, 0) / total;
      const variance =
        times.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / total;
      const stdDev = Math.sqrt(variance);
      return {
        question_id: parseInt(question_id),
        question,
        avgTimeTaken: mean,
        timeStdDev: stdDev,
        avgAttempts: attemptsSum / total,
        totalAttempts: total,
      };
    })
    .sort((a, b) => b.timeStdDev - a.timeStdDev)
    .slice(0, 5);

  // Top Performers (Bar Chart)
  const topPerformers = eloScores.sort((a, b) => b.elo - a.elo).slice(0, 5);

  console.log("Preparing response with processed data:", {
    eloScoresCount: eloScores.length,
    studentEloDetailsCount: studentEloDetails.length,
    hardestQuestionsCount: hardestQuestions.length,
  });

  return NextResponse.json({
    eloScores,
    performanceOverTime,
    studentEloDetails,
    hardestQuestions,
    studentHardestPerformance,
    lecturePerformance,
    mostActiveStudents,
    variabilityQuestions,
    topPerformers,
  });
}
