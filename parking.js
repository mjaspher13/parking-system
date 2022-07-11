import util from "util";
import { getRandomSize } from "./helper.js";
import { ParkingSpace } from "./parkingSpace.js";
import { Vehicle } from "./vehicle.js";
import { nanoid } from 'nanoid'
export class Parking {
  constructor(unparking) {
    this.unparking = unparking;
    this.MAX_COLS = 8;
    this.MAX_ROWS = 5;

    // Initialize our parking slots
    this.PARK = new Array(this.MAX_ROWS)
      .fill(null)
      .map(() => new Array(this.MAX_COLS).fill(null));

    // Initialize our parking spaces with random data
    this.initSpaces();

    // Let's define our entrance points
    this.ENTRANCE = [
      { name: "A", row: 0, col: 2 },
      { name: "B", row: 0, col: 6 },
      { name: "C", row: this.MAX_ROWS, col: 3 },
    ];
  }

  initSpaces() {
    for (let i = 0; i < this.MAX_ROWS; i++) {
      for (let j = 0; j < this.MAX_COLS; j++) {
        if (!this.isGateway(i, j)) {
          this.PARK[i][j] = new ParkingSpace(false, getRandomSize(), i, j);
        }
      }
    }
  }

  isGateway(row, col) {
    if (
      col == 0 ||
      row == 0 ||
      row == this.MAX_ROWS - 1 ||
      col == this.MAX_COLS - 1
    ) {
      return true;
    } else {
      return false;
    }
  }

  viewMap() {
    console.log(
      util.inspect(this.PARK, {
        showHidden: false,
        colors: true,
        compact: true,
        depth: null,
      })
    );
  }

  repark(ticket) {
    const  { start, fee, vsize, ent, } = ticket;
    const {value: size} = vsize;
    const oneHour = 1000 * 60;
    const diff = (new Date() - ticket.end) / 1000;
    if(diff < oneHour) {
        console.log("Continuous rate");
        this.park(size, ent, start, fee);
    }

    else { 
        console.log("Reset rate")
        this.park(size, ent);
    }

  }

  park(size, ent, start, fee) {
    let entrance = this.ENTRANCE.find((o) => o.name === ent.toUpperCase());
    let nrow = -1,
      ncol = -1;
    let distance = 9999;
    // Search for the nearest parking space
    for (let i = 0; i < this.MAX_ROWS; i++) {
      for (let j = 0; j < this.MAX_COLS; j++) {
        if (!this.isGateway(i, j)) {
          let p = this.PARK[i][j];
          if (size <= p.psize.value) {
            // Check if vehicle fits in parking slot
            let computedDistance =
              Math.abs(entrance.row - p.row) + Math.abs(entrance.col - p.col);
            if (distance > computedDistance && !p.occupied) {
              distance = computedDistance;
              nrow = i;
              ncol = j;
            }
          }
        }
      }
    }

    if (nrow == -1) {
      // No parking slot found
      console.log("No parking slot found");
      return false;
    } else {
      Object.assign(this.PARK[nrow][ncol], {
        occupied: true,
        vsize: new Vehicle(parseInt(size), Vehicle.getVehicleDesc(size)),
        row: nrow,
        col: ncol,
        ent,
        start: start ?  start : new Date(),
        fee,
      });

      return this.PARK[nrow][ncol];
    }
  }

  unpark(row, col) {
    const p = this.PARK[row][col];
    const diff = (new Date().getTime() - p.start.getTime()) / 1000;
    const totalPayable = this.compute(p.psize.value, diff);

    console.log(`Total charges: P ${totalPayable}`);
    const ticket_id = nanoid(6);
    const receipt = Object.assign({}, this.PARK[row][col]);
    receipt.ticket_id = ticket_id;
    receipt.end = new Date();
    receipt.fee = totalPayable;
    this.unparking.add(receipt)
    console.log(`Ticket Id: ${ticket_id}`);
    // Reset parking slot
    Object.assign(this.PARK[row][col], {
      occupied: false,
      vsize: null,
      start: null,
    });
  }

  // Compute total charges based on parking size and total time parked
  compute(size, totalTime) {
    let remainingTime = totalTime;
    let t24 = 1000 * 60 * 24;
    let t1h = 1000 * 60;
    let charges = 40;

    var hourlyCharge = 0;

    if (size == 0) {
      hourlyCharge = 20;
    } else if (size == 1) {
      hourlyCharge = 60;
    } else if (size == 2) {
      hourlyCharge = 100;
    }

    // For parking that exceeds 24 hours, every full 24 hour chunk is charged 5,000 pesos regardless of parking slot.
    if (remainingTime > t24) {
      let n24 = parseInt(totalTime / t24);
      charges += n24 * 5000;
      remainingTime -= n24 * t24;
    }

    remainingTime = remainingTime - t1h * 3;
   
    // The exceeding hourly rate beyond the initial three (3) hours will be charged as follows:
    // - 20/hour for vehicles parked in SP;
    // - 60/hour for vehicles parked in MP; and
    // - 100/hour for vehicles parked in LP
    if (remainingTime > 0) {
      let remainingHours = Math.ceil(remainingTime / t1h);
      charges += remainingHours * hourlyCharge;
    }

    // return total charges
    return charges;
  }
}
