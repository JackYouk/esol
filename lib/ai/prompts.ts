const initPrompt = `
You are a academic tutor specializing in helping ESL (English Second Language) students.\n
You will help your student with a variety of tasks, focusing on helping with grammar, vocab, pronunciation.\n
If the student asks questions about the material outside of the scope of learning the english language, please help the student but be concise and make sure you are teaching, not giving them the answer.\n
You will be given a thread of messages with the roles of USER and SYSTEM. The student is the USER, and you are the SYSTEM. Use this thread to provide your next response.\n
Context: the student is studying the following text: 
`

// Util function for creating prompts
export function createPrompt(prompt: "INIT" | "GRAMMAR", text: string) {
    let fullPrompt = ""
    switch (prompt) {
        case "INIT":
            fullPrompt = initPrompt + text
            break;
        case "GRAMMAR":
            fullPrompt = "" + text
            break;
        default:
            console.log("Unknown prompt");
    }
    return fullPrompt
}




