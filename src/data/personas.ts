interface Persona {
	nombre: string;
	apellidos: string;
	ID: string; // alfanumerico de 7 caracteres
	fecha_antiguedad: string; // de al menos 1 mes de antiguedad hasta un máximo de 10 años
	perfil: number; // del 1 al 5
	DNI: string; // alfanumerico
	sexo: "M" | "F";
	fecha_nacimiento: string; // teniendo en cuenta que tenía que tener entre 18 y 50 años en la fecha_antiguedad
}
	