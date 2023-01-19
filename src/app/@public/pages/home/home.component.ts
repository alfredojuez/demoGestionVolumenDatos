import { estadosService } from "./../../services/estados.service";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UserinfoService } from "../../services/userinfo.service";
import { removeSummaryDuplicates } from "@angular/compiler";

interface Persona {
	nombre: string;
	apellidos: string;
	ID: string; // alfanumerico de 7 caracteres
	fecha_antiguedad: string; // de al menos 1 mes de antiguedad hasta un máximo de 10 años
	perfil: number; // del 1 al 5
	DNI: string | null; // alfanumerico
	sexo: "M" | "F" | null;
	fecha_nacimiento: string | null; // teniendo en cuenta que tenía que tener entre 18 y 50 años en la fecha_antiguedad
}

@Component({
	selector: "app-home",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
	constructor(private userService: UserinfoService, private router: Router, public estados: estadosService) {}

	//ESTO podría ir en un JSON
	listadoGeneral = [];

	ngOnInit(): void {
		this.addPersons(25);
	}

	/**
	 * Leemos los datos de JSON proporcionado
	 * @returns
	 */
	getData() {
		console.log("Leyendo datos de ejemplo en JSON");
		console.log(this.listadoGeneral);
	}

	comprobarLogin() {
		this.userService.tryLogin();
		if (this.estoyLogado()) {
			console.log("Cargo datos");
			// this.listadoGeneral = this.getData();
		}
		//this.router.navigate(['/public']);
	}

	comprobarLoginAdmin() {
		this.userService.tryLoginAdmin();
		this.router.navigate(["/admin"]);
	}

	estoyLogado() {
		return this.userService.isLogged();
	}
	soyAdmin() {
		return this.userService.isAdmin();
	}

	formatos = [
		{
			valor: "2000",
			clave: "Excel 2000",
		},
		{
			valor: "XP",
			clave: "Excel XP",
		},
		{
			valor: "2003",
			clave: "Excel 2003",
		},
		{
			valor: "2007",
			clave: "Excel 2007",
		},
	];

	estiloSeleccionado = "2007";
	visionExtendidaColumnas = true;

	/**
	 * Carga la clase que le indiquemos para el excel
	 * @param valor
	 */
	setTableClass(valor) {
		this.estiloSeleccionado = valor;
	}

	/**
	 * Cambia evento mediante checkbox
	 * @param evento
	 */
	ChangeClass(evento) {
		evento.target.checked ? this.setTableClass("2007") : this.setTableClass("XP");
	}

	ShowColumns(evento) {
		this.visionExtendidaColumnas = !this.visionExtendidaColumnas;
	}

	/**
	 * Solicita información de la clase que debe cargar en el CSS
	 * @returns
	 */
	ChangeTableClass() {
		return "ExcelTable" + this.estiloSeleccionado;
	}

	getIcono(texto) {
		return this.estados.getIcofromEstado(texto);
	}

	/**
	 * Sistema de paginado
	 */
	paginaActual = 0;
	numeroElementos = 7;
	paginaMaxima = 1;

	getPaginaActual() {
		return this.paginaActual; 
	}

  getElementoXPagina()
  {
    return this.numeroElementos;
  }

	getPaginaMaxima() {
    this.paginaMaxima = Math.floor(this.listadoGeneral.length / this.numeroElementos) ;
		return this.paginaMaxima;
	}

	disable_boton_atras = true;
	disable_boton_siguiente = true;

	compruebaBotonesPaginado() {
		this.disable_boton_atras = 1 > this.paginaActual ? true : false;
		this.disable_boton_siguiente = this.paginaActual >= this.paginaMaxima ? true : false;
	}

	irAPagina(numero: number) {
		this.paginaActual = numero;
    this.paginaMaxima = Math.floor(this.listadoGeneral.length / this.numeroElementos);
		this.compruebaBotonesPaginado();
	}

	getListadoGeneralFiltrado() {
		let comienzo = this.paginaActual * this.numeroElementos;
		let final = comienzo + this.numeroElementos;
		this.paginaMaxima = Math.floor(this.listadoGeneral.length / this.numeroElementos);
		this.compruebaBotonesPaginado();
		return this.listadoGeneral.slice(comienzo, final);
	}
	/*** Fin sistema de paginado */

	/**
	 * Genera IDs dinámicamente de forma aleatoria a partir del perfil del usuario
	 * @returns
	 */
	getRandomID(perfil: number = 7): string {
		return  "ABCDE".charAt(perfil - 1).toUpperCase() + Math.floor(Math.random() * Math.pow(10, 6));
	}

	getRandomDNI(): string {
		return (Math.floor(Math.random() * 99999999)).toString() + "TRWAGMYFPDXBNJZSQVHLCKE"[Math.floor(Math.random() * 99999999) % 23] ;
	}
	getRandInt(max: number) {
		return Math.floor(Math.random() * max) + 1;
	}

	addPersons(numero: number = 10) {
		console.log(`Añadiendo ${numero} personas mas`);

		for (let i = 0; i < numero; i++) {
			let temp: Persona = { nombre: "", apellidos: "", ID: "", fecha_antiguedad: "", perfil: 1, DNI: "", sexo: null, fecha_nacimiento: "" };
			temp.perfil = this.getRandInt(5);
			temp.ID = this.getRandomID(temp.perfil);
			temp.nombre = this.nombres_base[this.getRandInt(this.nombres_base.length - 1)];
			temp.apellidos = this.apellidos_base[this.getRandInt(this.apellidos_base.length - 1)] + " " + this.apellidos_base[this.getRandInt(this.apellidos_base.length - 1)];
			temp.DNI = this.getRandomDNI();
			temp.sexo = temp.nombre.endsWith("l") || temp.nombre.endsWith("e") || temp.nombre.endsWith("a") ? "F" : "M";
			let entrada = 2020 - this.getRandInt(15);
			temp.fecha_antiguedad = entrada.toString() + "-01-01T00:00:00";
			temp.fecha_nacimiento = (entrada - 18 - this.getRandInt(20)).toString() + "-01-01T00:00:00"; //al menos tiene que tener 18 años cuando entró
			this.listadoGeneral.push(temp);
		}
	}

	estado = true;

	/**
	 * DATOS
	 */

	nombres_base = [
		"Maria",
		"Carlos",
		"Juliana",
		"Juan",
		"Ana",
		"Luis",
		"Andrea",
		"Pedro",
		"Gabriela",
		"Manuel",
		"Sofia",
		"Santiago",
		"Diana",
		"Daniel",
		"Isabel",
		"Enrique",
		"Jimena",
		"David",
		"Karina",
		"Jorge",
		"Carmen",
		"Jose",
		"Paula",
		"Francisco",
		"Natalia",
		"Diego",
		"Rosa",
		"Alberto",
		"Sara",
		"Javier",
		"Sandra",
		"Sergio",
		"Silvia",
		"Rafael",
		"Vanesa",
		"Pablo",
		"Adriana",
		"Alejandro",
		"Alejandra",
		"Antonia",
		"Beatriz",
		"Carla",
		"Claudia",
		"Cristina",
		"Daniela",
		"Elena",
		"Erika",
		"Jacqueline",
		"Julio",
		"Karen",
		"Katia",
		"Laura",
		"Liliana",
		"Lorena",
		"Lucia",
		"Luisa",
		"Maira",
		"Mireya",
		"Monica",
		"Norma",
		"Fatima",
		"Ahmed",
		"Sofia",
		"Maria",
		"Aisha",
		"Ali",
		"Amir",
		"Yasmin",
		"Sara",
		"Isabelle",
		"Noah",
		"Emily",
		"Evelyn",
		"Avery",
		"Abigail",
		"Mia",
		"Madison",
		"Elizabeth",
		"Ella",
		"Aubree",
		"Brooklyn",
		"Bella",
		"Aurora",
		"Kaylee",
		"Aaliyah",
		"Aubree",
		"Brooklyn",
		"Bella",
		"Aurora",
		"Kaylee",
		"Aaliyah",
		"Rylee",
		"Arianna",
		"Annabelle",
		"Maria",
		"Avery",
		"Evelyn",
		"Abigail",
		"Mia",
		"Madison",
		"Elizabeth",
		"Ella",
	];

	apellidos_base = [
		"Garcia",
		"Martinez",
		"Rodriguez",
		"Lopez",
		"Perez",
		"Gonzalez",
		"Ramirez",
		"Torres",
		"Gomez",
		"Diaz",
		"Alvarez",
		"Jimenez",
		"Moreno",
		"Romero",
		"Vazquez",
		"Mendoza",
		"Pena",
		"Sosa",
		"Castro",
		"Watson",
		"Brooks",
		"Kelly",
		"Sanders",
		"Price",
		"Bennett",
		"Wood",
		"Barnes",
		"Ross",
		"Henderson",
		"Coleman",
		"Jenkins",
		"Perry",
		"Powell",
		"Long",
		"Patterson",
		"Hughes",
		"Flores",
		"Washington",
		"Butler",
		"Simmons",
		"Foster",
		"Suarez",
		"Blanco",
		"Rios",
		"Aguilar",
		"Vargas",
		"Castillo",
		"Sandoval",
		"Ortiz",
		"Guerrero",
		"Cortes",
		"Santos",
		"Gutierrez",
		"Chavez",
		"Herrera",
		"Nunez",
		"Medina",
		"Avila",
		"Rojas",
		"Munoz",
		"De la Cruz",
		"Fernandez",
		"Juarez",
		"Estrada",
		"Enriquez",
		"Lara",
		"Reyes",
		"Hernandez",
		"Acosta",
		"Aguirre",
		"Aparicio",
		"Peterson",
		"Cooper",
		"Reed",
		"Bailey",
		"Bell",
		"Gomez",
		"Kelly",
		"Howard",
		"Ward",
		"Torres",
		"Ramirez",
		"James",
		"Arce",
		"Arriaga",
		"Avalos",
		"Barajas",
		"Barba",
		"Barboza",
		"Barragan",
		"Juez",
		"Tirado",
		"Becerra",
		"Beltran",
		"Benitez",
		"Bermejo",
		"Blanco",
		"Bravo",
		"Briones",
		"Bueno",
		"Caballero",
		"Cabrera",
		"Caceres",
		"Cadena",
		"Calderon",
		"Callejas",
		"Calvo",
		"Camacho",
		"Campos",
		"Canales",
		"Cano",
		"Cantu",
		"Evans",
		"Edwards",
		"Stewart",
		"Flores",
		"Morris",
		"Nguyen",
		"Murphy",
		"Rivera",
		"Cook",
		"Rogers",
		"Morgan",
		"Caraballo",
		"Caro",
		"Carrillo",
		"Castaneda",
		"Castro",
		"Cervantes",
		"Cisneros",
		"Colin",
		"Collado",
		"Colunga",
		"Concepcion",
		"Cordero",
		"Cornejo",
		"Cortes",
		"Crespo",
		"Cuellar",
		"Davalos",
		"De la Cruz",
		"Delgado",
		"Denis",
		"Dominguez",
		"Duran",
		"Echeverria",
		"Elizondo",
		"Enriquez",
		"Escalante",
		"Escarcega",
		"Escobar",
		"Espinosa",
		"Esquivel",
		"Baker",
		"Adams",
		"Nelson",
		"Carter",
		"Mitchell",
		"Perez",
		"Roberts",
		"Turner",
		"Phillips",
		"Campbell",
		"Parker",
		"Estrella",
		"Fajardo",
		"Farfan",
		"Farias",
		"Felix",
		"Fernadez",
		"Ferrer",
		"Fierro",
		"Flores",
		"Frausto",
		"Fuentes",
		"Galarza",
		"Gallegos",
		"Gallo",
		"Galvan",
		"Aragonés",
		"Simeone",
		"Carrasco",
		"Correa",
		"Abascal",
		"Abejón",
		"Acuña",
		"Adame",
		"Alarcón",
		"Albarracín",
		"Alcántara",
		"Alcázar",
		"Alcolea",
		"Alemán",
		"Lewis",
		"Lee",
		"Walker",
		"Hall",
		"Allen",
		"Young",
		"Hernandez",
		"King",
		"Wright",
		"Lopez",
		"Scott",
		"Green",
		"Alfaro",
		"Algarra",
		"Algeciras",
		"Algora",
		"Alhama",
		"Almansa",
		"Almazán",
		"Almodóvar",
		"Alpuente",
		"Alzira",
		"Amat",
		"Amezcua",
		"Andújar",
		"Ansoáin",
		"Añover",
		"Aoiz",
		"Araujo",
		"Arcos",
		"Argenta",
		"Ariño",
		"Arnedo",
		"Arróniz",
		"Arteche",
		"Asensio",
		"Asiáin",
		"Ateca",
		"Atienza",
		"Atienzo",
		"Aulestia",
		"Aurioles",
		"Jackson",
		"White",
		"Harris",
		"Martin",
		"Thompson",
		"Garcia",
		"Martinez",
		"Robinson",
		"Clark",
		"Rodriguez",
		"Azofra",
		"Azuara",
		"Badia",
		"Baena",
		"Báguena",
		"Bañuelos",
		"Barahona",
		"Baranda",
		"Barberán",
		"Barco",
		"Barriga",
		"Barriopedro",
		"Barrios",
		"Barrueta",
		"Báscara",
		"Bascones",
		"Bazán",
		"Beas",
		"Becerril",
		"Bejarano",
		"Benacazón",
		"Benavente",
		"Beneyto",
		"Benito",
		"Berrocal",
		"Berzosa",
		"Besora",
		"Besora",
		"Béjar",
		"Blanes",
		"Leon",
		"Garcia",
		"Ruiz",
		"Sánchez",
		"Ramos",
		"Flores",
		"Aguilar",
		"Lara",
		"Castro",
		"Ortiz",
		"Santos",
		"Luna",
		"Castillo",
		"Reyes",
		"Cruz",
		"Cervantes",
		"Vasquez",
		"Mendoza",
		"Lozano",
		"Guerrero",
		"Gallegos",
		"Pineda",
		"Romero",
		"Lozano",
		"Rios",
		"Lopez",
		"Medina",
		"Kim",
		"Smith",
		"Johnson",
		"Williams",
		"Jones",
		"Brown",
		"Miller",
		"Davis",
		"Rodriguez",
		"Martinez",
		"Hernandez",
		"Lopez",
		"Gonzalez",
		"Wilson",
		"Anderson",
		"Thomas",
		"Gonzales",
		"Bryant",
		"Alexander",
		"Russell",
		"Griffin",
		"Diaz",
		"Hayes",
	];

  
}
