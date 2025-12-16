import {Prompt, PromptProps} from "./Prompt";

export interface PromptProviderProps extends Omit<PromptProps, "children"> {
  children?: React.ReactNode;
}

export const PromptProvider = (props: PromptProviderProps) => {
  return <Prompt {...props} />;
};

