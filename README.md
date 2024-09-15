# COBBLEMON PARSER
Parse Cobblemon spawn data into one single output file! This code requires [NodeJS](https://nodejs.org/en/download/package-manager) v20.5.1 or later.

## Installation Instructions
1. Open Terminal
2. Change the current working directory to the location where you want the cloned directory
3. Type **git clone**, and then paste the URL you copied earlier.
> git clone https://github.com/YOUR-USERNAME/YOUR-REPOSITORY

4. Press **Enter** to create your local clone

5. Run **npm install** in the terminal
> npm install

6. Run **'npm run start'** or **'npm run dev'** to initialize the **'data'** and **'output'** folders
> npm run start

6. Place the entire Mod's .zip or .csv file in the **'data'** folder

*Note: CSV File required headers are (not case-sensitive, character-sensitive):*
- *pokémon, biome, preset, bucket, lv. min, lv. max, weight, canseesky*

7. ***(optional)*** For updated biome information by cobblemon update **'/src/utils/biomes_data.csv'** with [Cobblemon Spawn Definition](https://wiki.cobblemon.com/index.php/Pok%C3%A9mon/Spawning/Spawn_Definitions)

8. run **'npm run start'** or **'npm run dev'** to start the file
> npm run start

9. Get the updated file from **'/output/output.json'**