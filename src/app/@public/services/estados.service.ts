import { UpperCasePipe } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class estadosService {
  estados = [
    {'valor':'PENDIENTE', 'icono':'fa fa-clock'},
    {'valor':'REALIZADA', 'icono':'fa fa-thumbs-up'},
    {'valor':'CANCELADA', 'icono':'fa fa-thumbs-down'},
    {'valor':'POSTPUESTA', 'icono':'fa fa-share'}
  ];
  
  constructor() {}

  getList() {
    return this.estados;
  }

  getIcofromEstado(estado)
  {
    let respuesta = null
    this.estados.forEach(element => {
      if (element.valor === estado)
      {
        respuesta =  element.icono;
      }
    });
    return respuesta;
  }
}
