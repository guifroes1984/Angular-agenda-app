import { Component, OnInit } from '@angular/core';
import { ContatoService } from '../contato.service';
import { Contato } from './contato';

import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'

import { ContatoDetalheComponent } from '../contato-detalhe/contato-detalhe.component'
import { PageEvent } from '@angular/material/paginator'
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'app-contato',
  templateUrl: './contato.component.html',
  styleUrls: ['./contato.component.css']
})
export class ContatoComponent implements OnInit {

  formulario!: FormGroup;
  contatos: Contato[] = [];
  colunas = ['foto', 'id', 'nome', 'email', 'favorito']
  contatoSelecionado!: Contato;
  mensagemSucesso!: string;
  mensagemErro!: string;

  totalElementos = 0;
  pagina = 0;
  tamanho = 4;
  pageSizeOptions : number[] = [4]

  constructor(
    private service: ContatoService, 
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.montarFormulario();
    this.listarContatos(this.pagina, this.tamanho);
  }

    montarFormulario() {
      this.formulario = this.fb.group({
        nome: ['', Validators.required],
        email: ['', [Validators.required, Validators.email] ]
      })
    }

    listarContatos(pagina = 0, tamanho = 4) {
      this.service.list(pagina, tamanho).subscribe( response => {
        this.contatos = response.content;
        this.totalElementos = response.totalElements;
        this.pagina = response.number;
      })
    }

    favoritar(contato: Contato) {
      this.service.favourite(contato).subscribe(response => {
        contato.favorito = !contato.favorito;
      })

    }

  submit() {
    const formValues = this.formulario.value;
    const contato: Contato = new Contato(formValues.nome, formValues.email)
    this.service.save(contato).subscribe( resposta => {
      this.listarContatos();
      this.snackBar.open('O Contato foi adicionado!', 'Sucesso!', {
        duration: 2000
      })
      this.formulario.reset();
    })
  }

  uploadFoto($event: any, contato:any) {
    const files = $event.target.files;
    if(files){
      const foto = files[0];
      const formData: FormData = new FormData();
      formData.append("foto", foto);
      this.service
            .upload(contato, formData)
            .subscribe(response => this.listarContatos());
    }
  }

  visualizarContato(contato: Contato) {
    this.dialog.open(ContatoDetalheComponent, {
      width: '445px',
      height: '500px',
      data: contato
    })
  }

  paginar(event: PageEvent) {
    this.pagina = event.pageIndex;
    this.listarContatos(this.pagina, this.tamanho)
  }

  preparaDelecao(contato: Contato) {
    this.contatoSelecionado = contato;
  }

  deletarContato() {
    this.service
      .deletar(this.contatoSelecionado)
      .subscribe(respose =>{
        this.mensagemSucesso = 'Contato deletado com sucesso!'
        this.ngOnInit();
      },
      erro => this.mensagemErro = 'Ocorreu um erro ao deletar o contato.'
      )
  }

}
