// import OpenAI from 'openai';
// const openai = new OpenAI({
//   baseURL: "https://openrouter.ai/api/v1",
//   apiKey :import.meta.env.VITE_GOOGLE_GEMINI_API_KEY,
// });
// async function main() {
//   const completion = await openai.chat.completions.create({
//     model: "google/gemini-2.0-flash-exp:free",
//     messages: [
//       {
//         "role": "user",
//         "content": [
//           {
//             "type": "text",
//             "text": "What is in this image?"
//           },
//           {
//             "type": "image_url",
//             "image_url": {
//               "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
//             }
//           }
//         ]
//       }
//     ],
    
//   });

//   console.log(completion.choices[0].message);
// }

// main();

// const {GoogleGenerativeAI, HarmCategory,
// HarmBlockThreshold,} = require("@google/generative-ai");
// const apiKey = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
// const genAI = new GoogleGenerativeAI (apiKey);
// const model = genAl. getGenerativeModel({
//     model: "gemini-2.0-Flash",});

// const generationConfig = {
//     temperature : 1,
//     toP : 0.95
// }


import {GoogleGenAI,} from '@google/genai';

const Genai =  async (final_prompt) => {
  const ai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY,
  });
  const config = {
    responseMimeType: 'application/json',
  };
  const model = 'gemini-2.0-flash';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: final_prompt,
        },
      ],
    },
  ];

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });
  let fileIndex = 0;
  let final_response = '';
  for await (const chunk of response) {
    final_response += chunk.text
  }

  return final_response
}


export default Genai;
