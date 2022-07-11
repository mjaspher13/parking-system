import readline from "readline";
import { Parking } from "./parking.js";
import { Unpark } from "./unpark.js";
let unpark = new Unpark();
let parking = new Parking(unpark);

console.log("Parking system created...\n");

let prompt = "Select action [ p - park, u - unpark, m - map, r - repark, h - history, x - exit ]:";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt,
});

rl.prompt();

rl.on("line", (line) => {
  switch (line.trim()) {
    case "x":
      rl.close();
      break;
    case "p":
      rl.question("Vehicle size [ 0-S, 1-M, 2-L ]: ", function (v) {
        let strEntrance = parking.ENTRANCE.map((e) => e.name).join(",");
        rl.question(`Entrance [${strEntrance}]: `, function (entrance) {
          parking.park(v, entrance);
          rl.prompt();
        });
      });

      break;

    case "u":
      rl.question(
        "Location of vehicle to unpark. Seperate by a space [row column]: ",
        function (loc) {
          let strLoc = loc.trim().split(" ");

          if (strLoc.length >= 2) {
            let row = strLoc[0];
            let col = strLoc[1];
            parking.unpark(row, col);
            console.log("Vehicle unparked!");
          }
        }
      );
      break;

    case "m":
      parking.viewMap();
      break;

    case "r":
      rl.question("Enter ticket id for reparking: ", function (ticket_id) {
        const ticket = unpark.checkTicket(ticket_id);

        if(!ticket) console.log("Ticket ID is invalid!");

        else {
          parking.repark(ticket);
        }
      });
      break;

    case "h":
      unpark.viewHistory();
      break;

    default:
      break;
  }
  rl.prompt();
}).on("close", () => {
  console.log("Have a great day!");
  process.exit(0);
});

rl.on("close", function () {
  console.log("\nThank you! We are pleased to serve you.");
  process.exit(0);
});
