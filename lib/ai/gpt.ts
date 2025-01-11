import { Message, MessageRole } from "@prisma/client";
import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.ESOL_DEV });

export const gptGenerate = async (messages: Message[]) => {
    if (messages.length === 0) throw new Error("Messages are empty")
    const formattedMessages = messages.map(message => {
        const formattedRole =
            message.role === MessageRole.SYSTEM ? "system"
                : message.role === MessageRole.USER ? "user"
                    : "assistant";

        return { role: formattedRole, content: message.content };
    });

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: formattedMessages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    });

    return completion.choices[0].message.content;
};
