import natural, { stopwords } from "natural";
import stopword from "stopword";

type SpitContent = {
  content: string;
};
//We're using the Bag of Words/Bigrams model technique to create a predictive model for like & dislike.
//The purpose of this function is to prepare text.
//Then it will tokenize the text and remove stop words.
//The opinion parameter will be included within the like or dislike button to make this scalable for other rating types.
export function preprocessText(spitContent: string, opinion: string) {
  const tokenizer = new natural.WordTokenizer();
  const lowerSpitContent = spitContent.toLowerCase();
  const tokens = tokenizer.tokenize(lowerSpitContent);
  const filteredTokens =
    tokens?.filter((token) => !stopword.eng.includes(token)) || [];

  const bigrams = natural.NGrams.bigrams(filteredTokens);

  const transformedBigramsArray = bigrams.map((bigram) => {
    return {
      bigrams: bigram.join(" "),
      label: opinion,
    };
  });

  return transformedBigramsArray;
}

export function obtainFeatureCounts(
  bigramsDataArray: {
    bigrams: string;
    label: string;
  }[]
) {
  const featureCounts: { [key: string]: number } = {};

  for (const bigramData of bigramsDataArray) {
    const bigram = bigramData.bigrams;
    if (featureCounts[bigram]) {
      featureCounts[bigram] += 1;
    } else {
      featureCounts[bigram] = 1;
    }
  }

  return featureCounts;
}
