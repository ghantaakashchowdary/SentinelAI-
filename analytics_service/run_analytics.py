import json
import pandas as pd
from src.analytics.interpreter import SecurityInterpreter

def main():
    # Load dataset
    df = pd.read_csv("data/network_state_sequence.csv")
    
    # We will just take the last 5 windows to simulate current state
    sequence_df = df.tail(5)
    
    # Initialize the interpreter pointing to the artifacts directory
    interpreter = SecurityInterpreter(artifact_dir="artifacts")
    
    # Analyze
    result = interpreter.analyze_sequence(sequence_df)
    
    # Output structured JSON
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
