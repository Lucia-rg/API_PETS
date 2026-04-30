export const generateUserErrorInfo = (user) => {
    return `One or more properties are incomplete or invalid.
        List of required properties:
        * first_name: needs to be a String, received ${user.first_name}
        * last_name: needs to be a String, received ${user.last_name}
        * email: needs to be a String, received ${user.email}`
}

export const generatePetErrorInfo = (pet) => {
    return `The data to create the pet is invalid.
    Required properties:
    * name: needs to be a String, received ${pet.name}
    * specie: needs to be a String, received ${pet.specie}
    * birthDate: needs to be a String, received ${pet.birthDate}`
}