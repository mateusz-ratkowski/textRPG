# Text RPG Game and Engine

## Overview

This project is a simple text-based RPG (Role-Playing Game) engine written in JavaScript. The engine allows developers to create interactive text stories with branching paths, conditional logic, and customizable game states. It processes game data stored in text files and enables players to navigate through the game by selecting options.

## Features

1. **Dynamic Story Loading:**

   - The game loads story data from text files in the current directory.
   - Players can choose a file to play by selecting its number.

2. **Branching Paths:**

   - Each story contains scenes defined by titles, content, and possible answers.
   - Answers lead to different scenes based on player choices.

3. **Flags System:**

   - Flags are variables defined at the start of the game to manage game states.
   - Conditional logic allows showing or hiding options based on the values of flags.

4. **Keyboard Navigation:**

   - Use the arrow keys to navigate through answers.
   - Press `Enter` to confirm a choice.
   - Press `Ctrl+C` to exit the game.

5. **Error Handling:**

   - Checks for syntax errors in the story file.
   - Ensures proper formatting for conditions and scene definitions.

## How It Works

### Story File Format

The game parses specially formatted text files to create the story. Key elements include:

- **Scene Definition:**
  ```
  wt: wieczne biura {
      przechodząc dalej zaczynasz zauważać rzędy biur biegnące coraz dalej i dalej
      aż w końcu wchodzisz do wielkiego przeszklonego budynku a przed twoimi oczyma rysuje się ogromny posąg <-

      -> przyglądam mu się *blackFlag: true*; pogawędka;
      -> idę dalej; wieczne biura *blackFlag: true*;
  }
  ```

### Game Flow

1. The player selects a file from the directory.
2. The engine parses the story file into an array of objects representing scenes.
3. The game begins at the first scene, displaying its title, content, and options.
4. The player navigates options using the arrow keys and selects one to proceed.
5. The game updates flags and moves to the next scene based on the selected option.
6. The game ends when the player reaches a scene with a result of `END`.

## Usage

1. Place your story files in the same directory as the script.
2. Run the game:
   ```
   node textRPG.js
   ```
3. Follow the prompts to select a file and play the game.

## Keyboard Controls

- **Arrow Up/Down:** Navigate through options.
- **Enter:** Select an option.
- **Ctrl+C:** Exit the game.

## Development Notes

- Ensure story files are formatted correctly to avoid errors.
- The `flags` system supports boolean, numeric, and string values.
- Debug messages can be added by modifying the `console.log` statements in the code.

## License

This project is licensed under the CC0 1.0 Universal License.

