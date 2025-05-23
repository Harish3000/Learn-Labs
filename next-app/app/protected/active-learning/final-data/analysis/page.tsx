"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
} from "recharts";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSearchParams } from "next/navigation";

interface VectorAnalysisData {
  timestamps: string[];
  contentTypes: string[];
  contentIds: string[];
  cosineSimilarities: number[];
  centroidDistances: number[];
  magnitudes: number[];
  semanticDrift: number[];
  clusters: number[];
  outliers: boolean[];
}

interface AnalysisData {
  analysis_id: string;
  user_email: string;
  language_tone_preference: string;
  sentence_structure_preference: string;
  vocabulary_preference: string;
  readability_preference: string;
  clarity_preference: string;
  topic: string;
  topic_summary: string;
  detailed_analysis: any;
  statistical_comparison: any;
  generated_at: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background p-4 border rounded shadow-lg">
        <p className="text-sm font-semibold">{`${new Date(label).toLocaleString()}`}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value.toFixed(4)}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export default function AnalysisPage() {
  const [vectorAnalysisData, setVectorAnalysisData] =
    useState<VectorAnalysisData | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const userEmail = searchParams.get("userEmail") || "admin@learnlabs.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vectorResponse, analysisResponse] = await Promise.all([
          fetch(
            `/api/active-learning/get-vector-analysis?userEmail=${encodeURIComponent(userEmail)}`
          ),
          fetch("/api/active-learning/get-analysis"),
        ]);

        if (!vectorResponse.ok || !analysisResponse.ok) {
          throw new Error(
            `HTTP error! status: ${vectorResponse.status} ${analysisResponse.status}`
          );
        }

        const vectorData = await vectorResponse.json();
        const analysisData = await analysisResponse.json();

        setVectorAnalysisData(vectorData);
        setAnalysisData(analysisData.slice(0, 3));
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch analysis data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!vectorAnalysisData || analysisData.length === 0) {
    return <div>No data available</div>;
  }

  const chartData = vectorAnalysisData.timestamps.map((timestamp, index) => ({
    timestamp,
    cosineSimilarity:
      index > 0 ? vectorAnalysisData.cosineSimilarities[index - 1] : null,
    centroidDistance: vectorAnalysisData.centroidDistances[index],
    magnitude: vectorAnalysisData.magnitudes[index],
    semanticDrift:
      index > 0 ? vectorAnalysisData.semanticDrift[index - 1] : null,
    cluster: vectorAnalysisData.clusters[index],
    isOutlier: vectorAnalysisData.outliers[index],
    contentType: vectorAnalysisData.contentTypes[index],
    contentId: vectorAnalysisData.contentIds[index],
  }));

  const getYDomain = (data: any[], key: string) => {
    const values = data.map((item) => item[key]).filter(Boolean);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-primary">
        Preference analysis
      </h1>

      {analysisData.map((analysis, index) => (
        <Card key={analysis.analysis_id} className="mb-6">
          <CardHeader>
            <CardTitle>Analysis {index + 1}</CardTitle>
            <CardDescription>
              Generated at: {new Date(analysis.generated_at).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Topic:</strong> {analysis.topic}
            </p>
            <p>
              <strong>Summary:</strong> {analysis.topic_summary}
            </p>
            <p>
              <strong>Language Tone:</strong>{" "}
              {analysis.language_tone_preference}
            </p>
            <p>
              <strong>Sentence Structure:</strong>{" "}
              {analysis.sentence_structure_preference}
            </p>
            <p>
              <strong>Vocabulary:</strong> {analysis.vocabulary_preference}
            </p>
            <p>
              <strong>Readability:</strong> {analysis.readability_preference}
            </p>
            <p>
              <strong>Clarity:</strong> {analysis.clarity_preference}
            </p>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Lecturer's Style Evolution</CardTitle>
          <CardDescription>
            Tracking changes in writing style over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis
                yAxisId="left"
                domain={[0.9, 1]}
                tickCount={10}
                tickFormatter={(value) => value.toFixed(3)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[-100, 0]}
                tickCount={10}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="cosineSimilarity"
                stroke="#8884d8"
                name="Style Consistency"
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="centroidDistance"
                stroke="#82ca9d"
                name="Deviation from Average"
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="magnitude"
                stroke="#ffc658"
                name="Complexity"
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="semanticDrift"
                stroke="#ff7300"
                name="Semantic Drift"
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cluster Analysis</CardTitle>
          <CardDescription>
            Visualizing content clusters and outliers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="centroidDistance"
                name="Deviation from Average"
                domain={[0.9, 1]}
                tickCount={10}
                tickFormatter={(value) => value.toFixed(3)}
              />
              <YAxis
                dataKey="magnitude"
                name="Complexity"
                domain={[0.9, 1]}
                tickCount={10}
                tickFormatter={(value) => value.toFixed(3)}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={<CustomTooltip />}
              />
              <Legend />
              <Scatter
                name="Content Points"
                data={chartData}
                fill="#8884d8"
                shape="circle"
              >
                {chartData.map((entry, index) => (
                  <circle
                    key={`circle-${index}`}
                    cx={0}
                    cy={0}
                    r={entry.isOutlier ? 8 : 5}
                    fill={`hsl(${entry.cluster * 60}, 70%, 50%)`}
                    stroke={entry.isOutlier ? "red" : "none"}
                    strokeWidth={2}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* <Card>
        <CardHeader>
          <CardTitle>Content Details</CardTitle>
          <CardDescription>
            Detailed information about each content point
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Content Type</th>
                  <th>Content ID</th>
                  <th>Cluster</th>
                  <th>Outlier</th>
                </tr>
              </thead>
              <tbody>
                {chartData.map((item, index) => (
                  <tr
                    key={index}
                    className={item.isOutlier ? "bg-red-100" : ""}
                  >
                    <td>{new Date(item.timestamp).toLocaleString()}</td>
                    <td>{item.contentType}</td>
                    <td>{item.contentId}</td>
                    <td>{item.cluster}</td>
                    <td>{item.isOutlier ? "Yes" : "No"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card> */}
    </div>
  );
}
