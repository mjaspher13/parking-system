export class Vehicle {
    constructor(value, desc )  {
        this.value = value;
        this.desc = desc;
    }

   static getVehicleDesc(size) {

        switch ( parseInt(size) ) {
            case 0:
                return 'S'
                
            case 1:
                return 'M'
               
            case 2:
                return 'L'
               
            default:
                return ''

        }
    }
}