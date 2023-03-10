import { estadosService } from "./../../services/estados.service";
import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { UserinfoService } from "../../services/userinfo.service";

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
	dias_trabajo: number,
	dias_descansos: number,
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

	columnaOrdenada = "ID";
	direccionOrdenASC = true;

	/**
	 * Nos dice si quieren cambiar el tipo de ordenación o la columna 
	 * de ordenación sobre la que se ha pulsado.
	 */
	gestionOrdenacion(col: string) {
		// Si pulsan sobre la columna ordenada, es que cambiemos el orden
		if (col == this.columnaOrdenada) {
			this.direccionOrdenASC = !this.direccionOrdenASC;
		}
		else {
			this.columnaOrdenada = col;
			this.direccionOrdenASC = true;	//Por defecto siempre ASC la primera vez
		}
	}

	/**
	 * Nos devuelve el icono que tiene que pintar en cada columna solicitada.
	 * @param col 
	 * @returns 
	 */
	gestionIconoOrdenacion(col: string) {
		//por defecto icono neutro
		let respuesta ="";
		// "../../../../assets/imgs/neutro2.png";
		if (col == this.columnaOrdenada) {
			respuesta = (this.direccionOrdenASC ? "../../../../assets/imgs/a-z.png" : "../../../../assets/imgs/z-a.png")
		}
		return respuesta;
	}

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
		// hay que tener en cuenta:
		// columnaOrdenada = "ID";
		// direccionOrdenASC = true;
		let comienzo = this.paginaActual * this.numeroElementos;
		let final = comienzo + this.numeroElementos;
		this.paginaMaxima = Math.floor(this.listadoGeneral.length / this.numeroElementos);
		this.compruebaBotonesPaginado();
		//Hacemos una copia para ordenarla.
		let listadoTMP = this.listadoGeneral.slice(0, this.listadoGeneral.length - 1);

		let valor = this.columnaOrdenada;
		listadoTMP.sort(function (a, b,) {
			let orden = 0;
			switch (valor) {
				case "ID":
					orden = (a.ID > b.ID) ? 1 : -1;
					break;
				case "nombre":
					orden = (a.nombre > b.nombre) ? 1 : -1;
					break;
				case "apellidos":
					orden = (a.apellidos > b.apellidos) ? 1 : -1;
					break;
				case "perfil":
					orden = (a.perfil > b.perfil) ? 1 : -1;
					break;
				case "DNI":
					orden = (a.DNI > b.DNI) ? 1 : -1;
					break;
				case "sexo":
					orden = (a.sexo > b.sexo) ? 1 : -1;
					break;
				case "fecha_nacimiento":
					orden = (a.fecha_nacimiento > b.fecha_nacimiento) ? 1 : -1;
					break;
				case "fecha_antiguedad":
					orden = (a.ID > b.fecha_antiguedad) ? 1 : -1;
					break;

				default:
					orden = 0;
					break;
			}

			return orden;
		});

		if (!this.direccionOrdenASC) {
			listadoTMP.reverse();
		}
		
		return listadoTMP.slice(comienzo, final);
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

	/**
	 * Función que añade nuevas personas a la lista. 
	 * @param numero 
	 */
	addPersons(numero: number = 10) {
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

			//Añadimos el registro a la lista general.
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

	// personasMinimasXTurnos = {
	// 	M: 10,
	// 	T: 10,
	// 	N: 5,
	// };

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

	crearCuadranteMes() {
		this.cuadranteMes = {
			numeroMes: this.selectedMonth,
			dias: this.generarListadoDiasXMes(this.selectedMonth, this.selectedYear)
		};
	}


	realizandoCalculos = false;

	iniciaProcesoCuadrante() {
		this.realizandoCalculos = true;
		setTimeout(() => {
			// De esta manera conseguimos que muestre el gif 
			// animado de carga de datos
			this.rellenarCuadranteMes();
		}, 50);
	}

	porcentaje = 0;
	/**
	 * Para cada persona vamos a decirle que genere su cuadrante.
	 */
	rellenarCuadranteMes() {
		this.porcentaje = 0;
		let pos = 0;
		let max = this.listadoGeneral.length;

		this.listadoGeneral.forEach(async persona => {
			this.porcentaje = Math.floor(pos * 100 / max);
			this.generarCuadrantePersona(persona);
		});
		this.realizandoCalculos = false;
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



	/**
	 * Rellena en cuadranteMes los datos del técnico en los turnos 
	 * que corresponda atendiendo a la parametrización
	 * @param pSel 
	 */
	generarCuadrantePersona(pSel: Persona) {

		//Hay que tener en cuenta que una persona de un perfil determinado 
		//respete los días de trabajo seguidos y los descansos
		let contadorDiasTrabajo = 0;
		let contadorDiasDescanso = 0;
		let ultimoDia = 0;
		let busquedaTrabajo = true;
		let ultimoTurno = '';


		this.cuadranteMes.dias.forEach(dia => {
			dia.perfiles.forEach(perfil => {
				if (perfil.cod == pSel.perfil)	//estamos en el perfil correcto
				{
					//Buscamos trabajo (true) o descanso (false))?
					if (busquedaTrabajo) {
						if (contadorDiasTrabajo < perfil.dias_trabajo) {
							//Antes de mirar el lugar más optimo, hay que saber si ya se le ha asignado un turno ese día
							//Buscamos el turno con menos porcentaje de gente para este perfil
							if (!this.estoyAsignadoDia(JSON.parse(JSON.stringify(pSel)), JSON.parse(JSON.stringify(dia)))) {
								const optimo = this.buscaTurnoOptimo(perfil.turnos, ultimoTurno);
								let turnoAsignado = false;
								if (optimo != "") {	//Si se ha encontrado turno para ese día....
									perfil.turnos.forEach(turno => {
										if (turno.cod == optimo) {
											ultimoTurno = optimo;
											turnoAsignado = true;
											turno.personas.push(pSel);
											contadorDiasTrabajo++;
											if (contadorDiasTrabajo >= perfil.dias_trabajo) {
												busquedaTrabajo = false;
												contadorDiasTrabajo = 0;
											}
										}
									});
								}
								else {
									// En este caso que hacemos?
									// Si no hay hueco para ir a trabajar hay que dar salto en vacaciones o 
									// Se añade al cuadrante y se indica el exceso de gente?
									console.log("VACIO");

								}
								//Si los turnos estaban completos... y no se asigna turno, el numero de días trabajados se pone a 0
								if (!turnoAsignado) { contadorDiasTrabajo = 0; }
							}
						}
					}
					else {
						//Estamos buscando descanso
						contadorDiasDescanso++;
						if (contadorDiasDescanso >= perfil.dias_descansos) {
							contadorDiasDescanso = 0;
							busquedaTrabajo = true;
						}
					}
				}
			});
		});
	}

	/**
	 * Revisa si estoy asignado ya en algún turno del día dado.
	 * @param yo 
	 * @param dia 
	 */
	estoyAsignadoDia(yo: Persona, dia: Dia) {
		let encontrado = false;
		this.cuadranteMes.dias.forEach(item => {
			if (item.numero == dia.numero) {
				item.perfiles.forEach(element => {
					if (element.cod == yo.perfil) {
						element.turnos.forEach(turno => {
							turno.personas.forEach(tipo => {
								if (tipo.ID == yo.ID) {
									encontrado = true;
									return encontrado;
								}
							});
						});
					}
				});
			}
		});
		return encontrado;
	}

	/**
	 * En función de los turnos de este perfil, miramos cual no está completo y en ese caso, 
	 * cual está menos saturado
	 * @param turnos 
	 * @returns Devuelve el codigo del turno o la cadena vacía si están completos todos los 
	 * turnos
	 */
	buscaTurnoOptimo(turnos: Turno[], ultimoTurno): string {
		let respuesta = "";	//en caso de que todos los turnos estén completos.
		let porcentaje = 100;
		let p: Persona = null;
		let proximo = false;	//para que coja los turnos en orden ciclico
		turnos.forEach(turno => {
			// No queremos que se repita el último turno asignado
			// si el ultimo turno es vacio, podemos seleccionar el mejor
			// de todos
			// if (ultimoTurno!=turno.cod	
			// 	&& turno.personas.length < turno.personas_minimas) {
			// 	let tmpPorcentaje = (turno.personas.length * 100 / turno.personas_minimas);
			// 	if (porcentaje > tmpPorcentaje) {
			// 		respuesta = turno.cod;
			// 		porcentaje = tmpPorcentaje;
			// 		this.cdRef.markForCheck();
			// 	}
			// }
			if (ultimoTurno == "N") {
				console.log("PARAR AQUI")
			}
			//Si no hay ultimo turno, el más optimo de todos los que haya
			if (ultimoTurno == "") {
				if (turno.personas.length < turno.personas_minimas) {
					let tmpPorcentaje = (turno.personas.length * 100 / turno.personas_minimas);
					// console.log(`Turno ${turno.cod} -> ${tmpPorcentaje} de personas`)
					if (porcentaje > tmpPorcentaje) {
						respuesta = turno.cod;
						porcentaje = tmpPorcentaje;
					}
				}
			}
			else {
				if (ultimoTurno == turno.cod) {
					proximo = true;
				}
				else {
					if (proximo && turno.personas.length < turno.personas_minimas) {
						proximo = false;
						let tmpPorcentaje = (turno.personas.length * 100 / turno.personas_minimas);
						if (porcentaje > tmpPorcentaje) {
							respuesta = turno.cod;
							porcentaje = tmpPorcentaje;
						}
					}
				}
			}


		});

		// Si llegamos aqui y proximo es true, es que estábamos en el ultimo turno, 
		// y lo que le corresponde es el primero
		if (proximo) {
			for (let i = 0; i < turnos.length - 1; i++) {
				let tmpPorcentaje = (turnos[i].personas.length * 100 / turnos[i].personas_minimas);
				if (porcentaje > tmpPorcentaje) {
					respuesta = turnos[i].cod;
					porcentaje = tmpPorcentaje;
				}
			}
		}

		return respuesta
	}

	/**
	 * Genera el listado de los IDs de las personas facilitadas
	 * @param personas 
	 * @returns 
	 */
	listadoPersonas(personas: Array<Persona>) {
		let respuesta = "";

		personas.forEach(tipo => {
			respuesta += " - " + tipo.ID
		});

		return respuesta;
	}

	/**
	 * Configuración de perfiles para el calculo de los cuadrantes
	 */
	perfilesVacios = [
		{
			cod: 1,
			nombre: "Operador demanda",
			dias_trabajo: 3,
			dias_descansos: 2,
			procesable: true,
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
			dias_trabajo: 3,
			dias_descansos: 2,
			procesable: true,
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
					personas_minimas: 6,
					personas: []
				}
			]
		},
		{
			cod: 3,
			nombre: "GPEX",
			dias_trabajo: 3,
			dias_descansos: 3,
			procesable: false,
			turnos: [
				{
					cod: "M",
					hora_ini: "08:00",
					hora_fin: "15:00",
					horas: 7,
					personas_minimas: 3,
					personas: []
				},
				{
					cod: "T",
					hora_ini: "15:00",
					hora_fin: "22:00",
					horas: 7,
					personas_minimas: 3,
					personas: []
				},
				{
					cod: "N",
					hora_ini: "22:00",
					hora_fin: "08:00",
					horas: 10,
					personas_minimas: 3,
					personas: []
				}
			]
		},
		{
			cod: 4,
			nombre: "Jefe de Sala",
			dias_trabajo: 1,
			dias_descansos: 2,
			procesable: false,
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
			dias_trabajo: 2,
			dias_descansos: 4,
			procesable: false,
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

}
