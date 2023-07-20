import natural, { stopwords } from "natural";
import * as sw from "stopword";

type SpitContent = {
  content: string;
};

//Update: We need to use these functions on every like or dislike, and submit that information to the
//database. Use the bigram table & add a +1 to the like or dislike count.
//From there, we can do calculations while having a good storage method.

export function preprocessText(spitContent: string, opinion: string) {
  const tokenizer = new natural.WordTokenizer();
  const lowerSpitContent = spitContent.toLowerCase();
  const tokens = tokenizer.tokenize(lowerSpitContent);
  const filteredTokens = tokens ? sw.removeStopwords(tokens) : [];

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
