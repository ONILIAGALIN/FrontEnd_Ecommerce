export const typeToString = (type) => {
    switch(type){
        case 1: 
            return "Studio"
        case 2: 
            return "Suite"
        case 3: 
            return "Deluxe"
        default:
            return "Unknown"
    }
}

export const toPeso = (num) => {
    return new Intl.NumberFormat('en-US', {style: "currency", currency: 'PHP'}).format(num)
}