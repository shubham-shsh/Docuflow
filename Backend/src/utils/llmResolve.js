import OpenAI from "openai";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


export async function llmResolveQuery(message) {
  if (!message) return null;

  const prompt = `
    User message: "${message}"

    You are an alias resolution engine for a document management system.
    Convert the user message into a SINGLE most likely alias keyword.
    Return only 1 word or phrase (no explanation).

    Examples:
    "my aadhar" => "aadhar"
    "papa ka aadhar" => "papaaadhar"
    "light bill" => "electricity bill"
    "gas wala" => "gas bill"
    "college id" => "student id"
    "license" => "driving license"
    "pan card" => "pan"

    Now resolve:
    ${message}
    `;

  try {
    const res = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    return res.output_text?.trim().toLowerCase() || null;
  } catch (err) {
    console.error("[LLM alias error]", err);
    return null;
  }
}
