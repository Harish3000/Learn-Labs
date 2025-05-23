export const generates = {
  summarizeText: (text: string) =>
    `Please summarize the following text in concise and clear terms: ${text}`,
  generateAnswer: (question: string, content: string) =>
    `For the question: "${question}" and with the given content as the answer, please provide an appropriate response in HTML format. The answer content is: ${content}`,
  summarizeDocument: (content: string) =>
    `Please summarize the following document content in concise and clear terms: ${content}`,
  GrammerCkeck: (selectedText: string) =>
    `Correct the grammar of the following sentence:${selectedText}\nFixed Grammar:`,
  TopicSugesstion: (keywordsList: string[]) =>
    `Based on the following keywords: ${keywordsList}, generate 3 educational titles that students would find useful. dont put numbers in front of the titles.`,
};
