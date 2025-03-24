import { FilesetResolver, LlmInference } from "@mediapipe/tasks-genai";

export class MediaPipeInferenceService {
  llmInference: LlmInference | null = null;
  maxTokens = 2048;
  wasmFileLocation = "../../node_modules/@mediapipe/tasks-genai/wasm";
  modelFileLocation = "../../models/gemma3-1b-it-int4.task";

  initializeInference = async (): Promise<boolean> => {
    if (this.llmInference !== null) {
      return true;
    }

    const genaiFileset = await FilesetResolver.forGenAiTasks(this.wasmFileLocation);

    return new Promise((resolve, reject) => {
      LlmInference.createFromOptions(genaiFileset, {
        baseOptions: {
          modelAssetPath: this.modelFileLocation,
          delegate: "GPU",
        },
        maxTokens: this.maxTokens,
      })
        .then((llm) => {
          this.llmInference = llm;
          resolve(true);
        })
        .catch(() => {
          console.error("Failed to initialize LLM Inference Service.");
          reject();
        });
    });
  };

  sizeInTokens = (message: string): number => {
    return this.llmInference?.sizeInTokens(message) || 0;
  };

  generateResponse = async (message: string, callback?: (result: string, complete: boolean) => void)
    : Promise<{ result: string }> => {
    return new Promise(async (resolve, reject) => {
      let result = '';
      const tokenSize = this.sizeInTokens(message);
      if (tokenSize <= this.maxTokens) {
        await this.llmInference?.generateResponse(
          this.prompt(message),
          (partialResults: string, complete: boolean) => {
            result += partialResults;
            if (callback) {
              callback(result, complete);
            }
          });
        resolve({ result });
      } else {
        if (callback) {
          callback('Message too long for my abilities to response!!', true);
        }
        reject({ result: '' });
      }
    });
  }

  isReady = (): boolean => {
    return this.llmInference !== null;
  };

  defaultPrompt = `You are a highly capable AI assistant. Provide concise, accurate responses. Clarify ambiguities. 
   Use logic and creativity to solve problems. Be helpful while respecting ethics and safety. 
   Adapt your tone to the user.`;

  private prompt(message: string) {
    const promptBuilder = new Array<string>();
    const agent = this.getAgent(message);

    promptBuilder.push(`<start_of_turn>user\n`)
    promptBuilder.push(`${agent.message}<end_of_turn>`);
    promptBuilder.push(`<start_of_turn>model\n`);

    return promptBuilder.join("");
  }

  private getAgent = (message: string): { prompt: string, message: string } => {
    return { prompt: this.defaultPrompt, message: message };
  }
}