import util from "util";

export class Unpark {
    constructor() {
        console.log("Unpark created...\n");

        this.history = [];
    }

    add(newObject) {
        this.history.push(newObject);
    };

    viewHistory() {
        console.log(
            util.inspect(this.history, {
                showHidden: false,
                colors: true,
                compact: true,
                depth: null,
            })
        );
    }

    checkTicket(id) {
        return this.history.find((e) => e.ticket_id.toUpperCase() == id.toUpperCase()); 
    }
}