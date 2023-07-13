import natural, { stopwords } from "natural";
import stopword from "stopword";

type SpitContent = {
  content: string;
};
//We're using the Bag of Words model technique to create a predictive model for like & dislike.
//The purpose of this function is to prepare text.
//Then it will tokenize the text and remove stop words.
export function preprocessText(spitContent: SpitContent) {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(spitContent.content);
  const lowerCaseTokens = tokens?.map((token) => token.toLowerCase()) ?? [];
  const filteredTokens = lowerCaseTokens?.filter(
    (token) => !stopword.eng.includes(token)
  );

  const bigrams = natural.NGrams.bigrams(filteredTokens);

  return bigrams;
}
