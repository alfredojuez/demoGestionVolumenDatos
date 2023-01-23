import { estadosService } from "./../../services/estados.service";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UserinfoService } from "../../services/userinfo.service";
import { Time } from '@angular/common';

interface Persona {
	nombre: string;
	apellidos: string;
	ID: string; // alfanumerico de 7 caracteres
	fecha_antiguedad: string; // de al menos 1 mes de antiguedad hasta un máximo de 10 años
	perfil: number; // del 1 al 5
	DNI: string | null; // alfanumerico
	sexo: "M" | "F" | null;
	fecha_nacimiento: string | null; // teniendo en cuenta que tenía que tener entre 18 y 50 años en la fecha_antiguedad
	calle: string;
	numero: string;
	piso: string;
}

interface Turno {
	cod: string;
	horas: number;
	hora_ini: string;
	hora_fin: string;
	personas_minimas: number,
	personas: Array<Persona>;
}

interface Perfil {
	cod: number;
	nombre: string;
	turnos: Array<Turno>;
}

interface Dia {
	numero: number;
	diaSemana: string
	perfiles: Array<Perfil>;
}

interface Mes {
	numeroMes: number;
	dias: Array<Dia>;
}

@Component({
	selector: "app-home",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
	constructor(private userService: UserinfoService, private router: Router, public estados: estadosService) { }

	//ESTO podría ir en un JSON
	listadoGeneral = [];
	personaSeleccionada: Persona;

	seleccionaPersona(registro) {
		this.personaSeleccionada = registro;
	}

	ngOnInit(): void {
		if (this.estoyLogado()) {
			this.addPersons(10);
		}
	}

	comprobarLogin() {
		this.userService.tryLogin();
		if (this.estoyLogado()) {
			this.addPersons(6);
		}
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
	visionExtendidaColumnas = false;

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
	numeroElementos = 15;
	paginaMaxima = 1;

	getPaginaActual() {
		return this.paginaActual;
	}

	getElementoXPagina() {
		return this.numeroElementos;
	}

	getPaginaMaxima() {
		this.paginaMaxima = Math.floor(this.listadoGeneral.length / this.numeroElementos);
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

	perfiles: any[] = [
		{ id: 1, name: "Operador demanda" },
		{ id: 2, name: "Operador respuesta" },
		{ id: 3, name: "GPEX" },
		{ id: 4, name: "Jefe de Sala" },
		{ id: 5, name: "J2" },
	];

	getRandPerfil(): number {
		//La mayoría tienen que ser 1 u 2
		const probabilidades = [40, 35, 12, 8]; //el quinto perfil es lo que queda para el 100%
		const elegido = Math.random() * 100;
		let acumulado = 0;
		for (let i = 0; i < probabilidades.length; i++) {
			acumulado += probabilidades[i];
			if (elegido < acumulado) {
				return i + 1;
			}
		}
		return 5;
	}

	getLiteralPerfil(numero) {
		let respuesta = "";
		this.perfiles.forEach((element) => {
			if (element.id === numero) {
				respuesta = element.name;
			}
		});

		return respuesta;
	}

	/**
	 * Genera IDs dinámicamente de forma aleatoria a partir del perfil del usuario
	 * @returns
	 */
	getRandomID(perfil: number = 7): string {
		return "ABCDE".charAt(perfil - 1).toUpperCase() + Math.floor(Math.random() * Math.pow(10, 6));
	}

	getRandomDNI(): string {
		return Math.floor(Math.random() * 99999999).toString() + "TRWAGMYFPDXBNJZSQVHLCKE"[Math.floor(Math.random() * 99999999) % 23];
	}
	getRandInt(max: number) {
		return Math.floor(Math.random() * max) + 1;
	}

	getRandomDireccion(): string {
		return this.calles_base[Math.floor(Math.random() * this.calles_base.length - 1)];
	}

	getRandomPuerta() {
		let tipo = this.getRandInt(25);
		let respuesta = "";
		if (tipo >= 0 && tipo < 5) {
			//letras de la A a la F
			let letras = "ABCDEF";
			respuesta = "Puerta " + letras[this.getRandInt(letras.length - 1)];
		} else {
			if (tipo >= 6 && tipo < 12) {
				//izquierda derecha o centro
				let posicion = ["izquierda", "derecha", "centro"];
				respuesta = posicion[this.getRandInt(posicion.length - 1)];
			} else {
				//No tiene letra
			}
		}
		return respuesta;
	}

	addPersons(numero: number = 10) {
		console.log(`Añadiendo ${numero} personas mas`);

		for (let i = 0; i < numero; i++) {
			let temp: Persona = { nombre: "", apellidos: "", ID: "", fecha_antiguedad: "", perfil: 1, DNI: "", sexo: null, fecha_nacimiento: "", calle: "", numero: "", piso: "" };
			temp.perfil = this.getRandPerfil();
			temp.ID = this.getRandomID(temp.perfil);
			temp.nombre = this.nombres_base[this.getRandInt(this.nombres_base.length - 1)];
			temp.apellidos = this.apellidos_base[this.getRandInt(this.apellidos_base.length - 1)] + " " + this.apellidos_base[this.getRandInt(this.apellidos_base.length - 1)];
			temp.DNI = this.getRandomDNI();
			temp.sexo = temp.nombre.endsWith("l") || temp.nombre.endsWith("e") || temp.nombre.endsWith("a") ? "F" : "M";
			let entrada = 2020 - this.getRandInt(15);
			temp.fecha_antiguedad = entrada.toString() + "-01-01T00:00:00";
			temp.fecha_nacimiento = (entrada - 18 - this.getRandInt(20)).toString() + "-01-01T00:00:00"; //al menos tiene que tener 18 años cuando entró
			temp.calle = this.getRandomDireccion();
			temp.numero = this.getRandInt(190).toString() + (this.getRandInt(100) < 15 ? " Bis" : "");
			temp.piso = this.getRandInt(9).toString() + " " + this.getRandomPuerta();

			this.listadoGeneral.push(temp);
		}
	}

	cierraInfoPersona() {
		this.personaSeleccionada = null;
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

	calles_base = [
		"Calle de Alcalá",
		"Calle de Gran Vía",
		"Calle de Serrano",
		"Calle de Velázquez",
		"Calle del Prado",
		"Calle de Goya",
		"Calle de la Montera",
		"Calle de la Cava Baja",
		"Calle de la Reina",
		"Calle de la Fuente del Berro",
		"Calle de la Paz",
		"Calle de la Luna",
		"Calle de la Marina",
		"Calle de la Princesa",
		"Calle de la Flor",
		"Calle de la Virgen",
		"Calle de la Victoria",
		"Calle de la Palma",
		"Calle de la Ribera",
		"Calle de Sol",
		"Calle de la Fuente de Neptuno",
		"Calle de la Plaza Mayor",
		"Calle de la Catedral",
		"Calle de la Estación",
		"Calle del Arenal",
		"Calle de la Fuente Luminosa",
		"Calle de la Concordia",
		"Calle de la Paz",
		"Calle de la Ronda",
		"Calle del General Prim",
		"Calle de la Aurora",
		"Calle de la Paz",
		"Calle de la Paz",
		"Calle de la Libertad",
		"Calle de la Fontana",
		"Calle de la Bolsa",
		"Calle de la Fuente de la Cascada",
		"Calle de la Fuente del Ángel",
		"Calle de la Iglesia",
		"Calle del Parque",
		"Gran Vía, Madrid",
		"Paseo de la Castellana",
		"Paseo de Gracia",
		"Avenida de la Constitución",
		"Avenida del Paralelo",
		"Avenida de la Reina Maria Cristina",
		"Avenida del Generalísimo",
		"Avenida de la Ciudad de Barcelona",
		"Avenida de la Libertad",
		"Avenida de la Independencia",
		"Avenida de la Paz",
		"Avenida de los Reyes Católicos",
		"Avenida de la Palmera",
		"Avenida de la Marina",
		"Avenida de la Diputación",
		"Avenida de la Playa",
	];

	/**
	 * Generación de turnos
	 *
	 */

	personasMinimasXTurnos = {
		M: 10,
		T: 10,
		N: 5,
	};

	months: any[] = [
		{ id: 1, name: "Enero" },
		{ id: 2, name: "Febrero" },
		{ id: 3, name: "Marzo" },
		{ id: 4, name: "Abril" },
		{ id: 5, name: "Mayo" },
		{ id: 6, name: "Junio" },
		{ id: 7, name: "Julio" },
		{ id: 8, name: "Agosto" },
		{ id: 9, name: "Septiembre" },
		{ id: 10, name: "Octubre" },
		{ id: 11, name: "Noviembre" },
		{ id: 12, name: "Diciembre" },
	];

	getLiteralMonth(numero) {
		let respuesta = "";
		this.months.forEach((element) => {
			if (element.id === numero) {
				respuesta = element.name;
			}
		});

		return respuesta;
	}

	selectedMonth = 1;
	selectedYear = 2023;

	cuadranteMes: Mes = null;


	delays: any[] = [
		{ perfil: 1, dias: 4, descansos: 3 },
		{ perfil: 2, dias: 4, descansos: 3 },
		{ perfil: 3, dias: 2, descansos: 2 },
		{ perfil: 4, dias: 7, descansos: 7 },
		{ perfil: 5, dias: 10, descansos: 10 },
	];

	setDelay(perfil: number, dias: number, descansos: number) {
		this.delays.forEach(element => {
			if (element.perfil === perfil) {
				element.dias = dias;
				element.descansos = descansos;
			}
		});
	}

	getDelay(perfil) {
		let respuesta = null;

		this.delays.forEach(element => {
			if (element.perfil === perfil) {
				respuesta = element;
			}
		});

		return respuesta;
	}

	crearCuadranteMes() {
		console.log(`Solicitado cuadrante del mes ${this.selectedMonth} de ${this.selectedYear}`);
		this.cuadranteMes = {
			numeroMes: this.selectedMonth,
			dias: this.generarListadoDiasXMes(this.selectedMonth, this.selectedYear)
		};
	}

	/**
	 * Para cada persona vamos a decirle que genere su cuadrante.
	 */
	rellenarCuadranteMes() {
		console.log("Solicitado rellenado de cuadrante")
		this.listadoGeneral.forEach(persona => {
			this.generarCuadrantePersona(persona);
		});
	}

	listadoFechas = null;

	generarListadoDiasXMes(mes: number, anio: number): Array<Dia> {
		const fecha = new Date(anio, mes - 1);
		const ultimoDia = new Date(anio, mes, 0).getDate();
		const dias: Array<Dia> = [];
		for (let numero = 1; numero <= ultimoDia; numero++) {
			fecha.setDate(numero);
			dias.push({
				numero,
				diaSemana: fecha.toLocaleString("default", { weekday: "long" }),
				perfiles: JSON.parse(JSON.stringify(this.perfilesVacios))		//para que sea copia no referencia
			}); // es lo mismo que (dia:dia, diaSemana:diaSemana , personas:[])
		}
		return dias;
	}




	perfilesVacios = [
		{
			cod: 1,
			nombre: "Operador demanda",
			turnos: [
				{
					cod: "M",
					hora_ini: "08:00",
					hora_fin: "15:00",
					horas: 7,
					personas_minimas: 5,
					personas: []
				},
				{
					cod: "T",
					hora_ini: "15:00",
					hora_fin: "22:00",
					horas: 7,
					personas_minimas: 5,
					personas: []
				},
				{
					cod: "N",
					hora_ini: "22:00",
					hora_fin: "08:00",
					horas: 10,
					personas_minimas: 7,
					personas: []
				}
			]
		},
		{
			cod: 2,
			nombre: "Operador respuesta",
			turnos: [
				{
					cod: "M",
					hora_ini: "08:00",
					hora_fin: "15:00",
					horas: 7,
					personas_minimas: 15,
					personas: []
				},
				{
					cod: "T",
					hora_ini: "15:00",
					hora_fin: "22:00",
					horas: 7,
					personas_minimas: 15,
					personas: []
				},
				{
					cod: "N",
					hora_ini: "22:00",
					hora_fin: "08:00",
					horas: 10,
					personas_minimas: 15,
					personas: []
				}
			]
		},
		{
			cod: 3,
			nombre: "GPEX",
			turnos: [
				{
					cod: "M",
					hora_ini: "08:00",
					hora_fin: "15:00",
					horas: 7,
					personas_minimas: 9,
					personas: []
				},
				{
					cod: "T",
					hora_ini: "15:00",
					hora_fin: "22:00",
					horas: 7,
					personas_minimas: 9,
					personas: []
				},
				{
					cod: "N",
					hora_ini: "22:00",
					hora_fin: "08:00",
					horas: 10,
					personas_minimas: 5,
					personas: []
				}
			]
		},
		{
			cod: 4,
			nombre: "Jefe de Sala",
			turnos: [
				{
					cod: "A",
					hora_ini: "08:00",
					hora_fin: "20:00",
					horas: 12,
					personas_minimas: 2,
					personas: []
				},
				{
					cod: "P",
					hora_ini: "20:00",
					hora_fin: "08:00",
					horas: 12,
					personas_minimas: 2,
					personas: []
				}
			]
		},
		{
			cod: 5,
			nombre: "J2",
			turnos: [
				{
					cod: "D",
					hora_ini: "08:00",
					hora_fin: "08:00",
					horas: 24,
					personas_minimas: 1,
					personas: []
				}
			]
		}
	]


	/**
	 * Rellena en cuadranteMes los datos del técnico en los turnos 
	 * que corresponda atendiendo a la parametrización
	 * @param pSel 
	 */
	generarCuadrantePersona(pSel: Persona) {
		console.log(`Nos llega persona ${pSel.ID} con perfil ${pSel.perfil}`)
		for (let i = 0; i < 15; i++) {
			this.cuadranteMes.dias.forEach(d => {
				if (d.numero == i)	//estamos en el día correcto.
				{
					d.perfiles.forEach(p => {
						if (p.cod == pSel.perfil)	//estamos en el perfil correcto
						{
							//Buscamos el turno con menos porcentaje de gente para este perfil
							const optimo = this.buscaTurnoOptimo(p.turnos);

							p.turnos.forEach(t => {
								if (t.cod == optimo) {
									t.personas.push(pSel);
									console.log(`Añadimos persona ${pSel.ID}`)
								}
							});
						}
					});
				}
			});
		}
	}

	/**
	 * En función de los turnos de este perfil, miramos cual no está completo y en ese caso, 
	 * cual está menos saturado
	 * @param turnos 
	 * @returns Devuelve el codigo del turno o la cadena vacía si están completos todos los 
	 * turnos
	 */
	buscaTurnoOptimo(turnos: Turno[]): string {
		console.log(turnos);
		let respuesta = "";	//en caso de que todos los turnos estén completos.
		let porcentaje = 100;

		console.log("Porcentajes")

		turnos.forEach(turno => {
			if (turno.personas.length < turno.personas_minimas) {
				let tmpPorcentaje = (turno.personas.length * 100 / turno.personas_minimas);
				if (porcentaje > tmpPorcentaje) {
					respuesta = turno.cod;
					porcentaje = tmpPorcentaje;
				}
			}
		});


		console.log(`Respuesta ${respuesta} <--`);
		return respuesta
	}

}
