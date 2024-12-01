export const generates = {
  summarizeText: (text: string) =>
    `Please summarize the following text in concise and clear terms: ${text}`,
  generateAnswer: (question: string, content: string) =>
    `For the question: "${question}" and with the given content as the answer, please provide an appropriate response in HTML format. The answer content is: ${content}`,
  summarizeDocument: (content: string) =>
    `Please summarize the following document content in concise and clear terms: ${content}`,
};
