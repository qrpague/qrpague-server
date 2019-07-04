const compare = (d1, d2) => {
    if(
        !d1 || 
        !d2 ||
        !(d1 instanceof Date) ||
        isNaN(d1.valueOf()) ||
        !(d2 instanceof Date) ||
        isNaN(d2.valueOf()) 
    ){
        return null;
    }
    if(d1.getTime() === d2.getTime()){
        return 0;
    } else if(d1.getTime() < d2.getTime()) {
        return -1;
    } else {
        return 1;
    }
}

module.exports = {
    compare
}