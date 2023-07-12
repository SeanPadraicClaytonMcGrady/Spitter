import natural, { Tokenizer } from "natural";
import stopword from "stopword";

type MessageData = {
  content: string;
  liked: boolean;
  disliked: boolean;
  neutral: boolean;
}[];

//We're using the Bag of Words model technique to create a predictive model for like & dislike.
//The purpose of this function is to prepare text for the model.
//It will receive the content from the fetchTrainingMessageData function in dataUtils.ts.
//Then it will tokenize the text and remove stop words.
export default function preprocessText(
  data: MessageData
): { content: string; liked: boolean; disliked: boolean; neutral: boolean }[] {
  const preprocessedData = data.map(({ content, liked, disliked, neutral }) => {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(content);

    const lowerCaseTokens: string[] =
      tokens?.map((token) => token.toLocaleLowerCase()) ?? [];
    const filteredTokens = stopword.removeStopwords(lowerCaseTokens);

    const preprocessedText = filteredTokens.join(" ");

    if (liked) {
      return {
        content: preprocessedText,
        liked: true,
        disliked: false,
        neutral: false,
      };
    }

    if (disliked) {
      return {
        content: preprocessedText,
        liked: false,
        disliked: true,
        neutral: false,
      };
    }

    if (neutral) {
      return {
        content: preprocessedText,
        liked: false,
        disliked: false,
        neutral: true,
      };
    }

    return {
      content: "",
      liked: false,
      disliked: false,
      neutral: false,
    };
  });

  const filteredData = preprocessedData.filter(Boolean);

  return filteredData;
}


export default function buildVocabulary(data: MessageData) {

    //Here we index the words into word-index pairs. 
    return void
}

