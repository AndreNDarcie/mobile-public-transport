/*
	PLANEJADOR DE VIAGENS
*/

//Le o JSON do arquivo database.json
var obj = pontosDB;
var map;

/* pontoAtual = "Partida" ou "Chegada" */
var pontoAtual = "";
var mensagem = document.getElementById("mensagem-planejador-viagens");
var listaMelhoresLinhas = document.getElementById("lista-melhores-linhas");
var baldeacaoAtiva = false;

var markers = new L.FeatureGroup();

/* Ponto de partida e de chegada como marcador */
var marcadorPartida = L.marker([0, 0]);
var marcadorChegada = L.marker([0, 0]);

/* Ponto de partida e de chegada */
var pontoPartida;
var pontoChegada;

desenhaOptions();
iniciarMapa();

var plan_trip = false;

function iniciarMapa() {
    map = L.map("mapa").setView([-21.786, -46.566], 16);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

    map.invalidateSize();
}

function desenhaOptions() {
    var i = 0;
    var select = document.getElementById('comboLinhas');
    var nomeLinhas = [];

    for (i = 0; i < obj.Linhas.length; i++) {
        nomeLinhas.push(obj.Linhas[i].tipo + " - " + obj.Linhas[i].nome);
    }

    /*
    var nomeLinhas = ["A001 - CIRCULAR CENTRO / TURISMO", "F208 - BAIRRO SOUZA LIMA / ESTAÇÃO CENTRAL", "F306 - INTEGRAÇÃO FAZENDA / ESTAÇÃO CENTRAL",
		"LE 01 - PUC / PITÁGORAS", "LE 02 - UNIFAL / PITÁGORAS", "N11 - CORUJÃO COHAB", "N23 - CORUJÃO P. PRETA / P. COBERTA (SENTIDO P.COBERTA)",
	    "N23 - CORUJÃO P. PRETA / P. COBERTA (SENTIDO P.PRETA)", "P21 - ESTAÇÃO SUL / ESTAÇÃO VILA NOVA", "P21 - ESTAÇÃO VILA NOVA / ESTAÇÃO SUL",
	    "P21 - ESTAÇÃO VILA NOVA / ESTAÇÃO SUL"]
    */

    for (i = 0; i < nomeLinhas.length; i++) {
        var opt = document.createElement('option');
        opt.value = +i;
        opt.innerHTML = nomeLinhas[i];
        opt.id = opt.value;
        select.appendChild(opt);
    }
}

function melhorPontoLinha(PontoA) {

    var menorDistancia = Number.POSITIVE_INFINITY;
    var menorTempoTotalPonto = Number.POSITIVE_INFINITY;
    var listaMelhoresPontos = [];
    var horarioAtual = pegarHorarioAtual();
    //var velocidadeMedia = 67; //metros por minuto
    var velocidadeMedia = 30; //metros por minuto

    var a;
    var b = 0;

    //Le todas as linhas
    for (a = 0; a < obj.Linhas.length; a++) {

        //Le todos os sentidos
        //for (var b = 0; b < obj.Linhas[a].sentidos.length; b++) {

        //Le todos os pontos
        for (var c = 0; c < obj.Linhas[a].sentidos[b].pontos.length; c++) {

            var PontoB = L.latLng(obj.Linhas[a].sentidos[b].pontos[c].lat, obj.Linhas[a].sentidos[b].pontos[c].long);
            var distanciaMetros = PontoA.distanceTo(PontoB);


            var tempoMinutosDistancia = distanciaMetros / velocidadeMedia;
            var horarioProximaParada = obj.Linhas[a].sentidos[b].pontos[c].horariosSegSex[0];

            //Separada do texto hora e minutos e converte para inteiro
            var hora = parseInt(horarioProximaParada[0] + horarioProximaParada[1]);
            var minuto = parseInt(horarioProximaParada[3] + horarioProximaParada[4]);

            var hora2 = parseInt(horarioAtual[0] + horarioAtual[1]);
            var minuto2 = parseInt(horarioAtual[3] + horarioAtual[4]);

            //Converte as horas e minutos para minutos
            var horarioProximaParadaMinutos = (hora * 60) + minuto;
            var horarioAtualMinutos = (hora2 * 60) + minuto2;

            //Calcula o valor total em minutos, considerando tempo de espera e tempo de caminhada
            var tempoTotalPonto = tempoMinutosDistancia + (horarioProximaParadaMinutos - horarioAtualMinutos);

            if (tempoTotalPonto < menorTempoTotalPonto) {
                menorTempoTotalPonto = tempoTotalPonto;
                var pontoId = obj.Linhas[a].sentidos[b].pontos[c].id;
            }
        }
        //}

        listaMelhoresPontos[a] = {
            linha: a,
            pontoId: pontoId,
            distancia: menorTempoTotalPonto,
            ponto: PontoB,
            baldeacao: 1
        };
        menorTempoTotalPonto = Number.POSITIVE_INFINITY;
    }

    listaMelhoresPontos.sort(function(a, b) {
        if (a.distancia < b.distancia)
            return -1;
        if (a.distancia > b.distancia)
            return 1;
        return 0;
    });

    return listaMelhoresPontos;

}

function pegarHorarioAtual() {
    return "10:00";
}

function iniciarPlanejadorViagens() {

    plan_trip = true;

    document.getElementById("menu-principal").style.display = 'none';
    document.getElementById("comboLinhas").style.display = 'none';
    //document.getElementById("origemDestino").style.display = 'none';
    document.getElementById("fav").style.display = 'none';

    document.getElementById("mensagem-planejador-viagens").style.display = 'block';
    document.getElementById("lista-melhores-linhas").style.display = 'block';
    document.getElementById("lista-melhores-linhas").innerHTML = "";

    var planejador_viagens = document.getElementById("planejador-viagens");
    planejador_viagens.style.display = 'block';
    planejador_viagens.onclick = function() {
        finalizarPlanejadorViagens();
    };

    mensagem.style.display = 'block';

    mensagem.innerHTML = "<div><span class='icon'>i</span>Toque no mapa para escolher o ponto de <span class='cor-origem'>partida</span>!</div>" +
        "<div style='font-size: 90%;'><input type='checkbox' value='GPS'> Local atual </div>";

    //Remove a layer antiga com os marcadores
    map.removeLayer(markers);
    markers = new L.FeatureGroup();

}

function finalizarPlanejadorViagens(){

  plan_trip = false;

  document.getElementById("menu-principal").style.display = 'block';
  document.getElementById("comboLinhas").style.display = 'block';
  document.getElementById("fav").style.display = 'block';

  document.getElementById("planejador-viagens").style.display = 'none';
  mensagem.style.display = 'none';

  document.getElementById("mensagem-planejador-viagens").style.display = 'none';
  document.getElementById("lista-melhores-linhas").style.display = 'none';

  //Remove os pontos de partida e chegada do mapa
  map.removeLayer(marcadorPartida);
  map.removeLayer(marcadorChegada);

  //Remove a layer antiga com os marcadores
  map.removeLayer(markers);
  markers = new L.FeatureGroup();

  pontoAtual = "";
  estadoPlanejadorViagens = "";
  baldeacaoAtiva = false;

}

map.on('click', function(e) {

    if(plan_trip) {

    marcadorDinamico = e.latlng;

    if (!baldeacaoAtiva) {

        listaMelhoresLinhas.innerHTML = "";

        if (pontoAtual === "") {
            marcadorPartida = L.marker(marcadorDinamico, {
                    icon: busIconOrigem
                }).addTo(map)
                .bindPopup("<span class='cor-origem'>Partida</span>");

            pontoPartida = marcadorDinamico;
            mudarEstadoPlanejadorViajens("partida");

            pontoAtual = "Partida";


        } else if (pontoAtual == "Partida") {
            marcadorChegada = L.marker(marcadorDinamico, {
                    icon: busIconDestino
                }).addTo(map)
                .bindPopup("<span class='cor-destino'>Chegada</span>");

            pontoChegada = marcadorDinamico;
            mudarEstadoPlanejadorViajens("partida-chegada");
            pontoAtual = "Chegada";

        } else if (pontoAtual == "Chegada") {

            map.removeLayer(marcadorPartida);
            map.removeLayer(marcadorChegada);

            mensagem.style.height = '32px';
            mensagem.innerHTML = "<div><span class='icon'>i</span>Toque no mapa para escolher o ponto de <span class='cor-origem'>partida</span>!</div>" +
                "<div style='font-size: 90%;'><input type='checkbox' value='GPS'> Local atual </div>";
            pontoAtual = "";
        }
    }
  }

});

/*
	Tipos: partida, partida-chegada, baldeacao
*/
var estadoPlanejadorViagens = "";

function mudarEstadoPlanejadorViajens(estadoAtual) {


    listaMelhoresLinhas.style.display = 'block';
    baldeacaoAtiva = false;

    switch (estadoAtual) {
        case "partida":

            gerarTabelaLinhasProximasPartida();

            mensagem.style.height = '28px';
            mensagem.innerHTML = "<span class='icon'>i</span>Toque no mapa para escolher o ponto de <span class='cor-destino'>chegada</span>!";

            estadoPlanejadorViagens = "partida";
            break;
        case "partida-chegada":

            gerarTabelaLinhasProximasPartidaChegada();

            mensagem.style.height = '18px';
            mensagem.innerHTML = "<div><span class='icon'>i</span>Toque novamente no mapa para reiniciar!</div>";

            estadoPlanejadorViagens = "partida-chegada";
            break;
        case "baldeacao":
            baldeacaoAtiva = true;

            gerarTabelaLinhasBaldeacao();

            mensagem.style.height = '20px';
            mensagem.innerHTML = "<div><span class='icon'>i</span>Selecione duas linhas para formar uma rota.</div>";

            estadoPlanejadorViagens = "baldeacao";
            break;
    }
}

/*
    == == Geradores de tabelas == ==
*/

/* Gera uma tabela com uma lista de nomes das linhas que são próximas a partida */
function gerarTabelaLinhasProximasPartida() {

    //Buscar as linhas que tem os pontos mais proximos a partida
    var listaLinhasProximasPartida = melhorPontoLinha(pontoPartida);
    var out = "";
    var idLinha = 0;

    out = "<table><tr><th>Linhas próximas a <span class='cor-origem'>partida</span></th></tr>";

    //Exibe todas as linhas
    for (var i = 0; i < listaLinhasProximasPartida.length; i++) {
        idLinha = listaLinhasProximasPartida[i].linha;
        out += "<tr><td onClick='selecionaLinha(this,\"partida\"," + idLinha + ")'>" + obj.Linhas[idLinha].nome + "</td></tr>";
    }

    out += "</table>";
    listaMelhoresLinhas.innerHTML = out;
}

/* Gera uma tabela com uma lista de nomes das linhas que são próximas a partida e a chegada */
function gerarTabelaLinhasProximasPartidaChegada() {

    var out = "";

    //Buscar as linhas que tem os pontos mais proximos a partida e chegada
    var listaLinhasProximasPartida = melhorPontoLinha(pontoPartida);
    var listaLinhasProximasChegada = melhorPontoLinha(pontoChegada);

    var idLinha = 0;

    out = "<table><tr><th>Melhores linhas</th></tr>";

    //Percorrer as duas linhas
    for (var x = 0; x < listaLinhasProximasPartida.length; x++) {
        for (var y = 0; y < listaLinhasProximasChegada.length; y++) {

            //Verificar se a linha de partida e chegada é a mesma
            if (listaLinhasProximasPartida[x].linha == listaLinhasProximasChegada[y].linha) {
                idLinha = listaLinhasProximasPartida[x].linha;
                out += "<tr><td onClick='selecionaLinha(this,\"partida-chegada\"," + idLinha + ")'>" + obj.Linhas[idLinha].nome + "</td></tr>";
            }
        }
    }

    out += "</table><button style='width: 100%' onclick='mudarEstadoPlanejadorViajens(\"baldeacao\")'>Ir para baldeação</button>";

    listaMelhoresLinhas.innerHTML = out;
}

/* Gera duas tabelas com os nomes das linhas que estão próximas a partida e chegada */
function gerarTabelaLinhasBaldeacao() {

    //Buscar as linhas que tem os pontos mais proximos a partida e chegada
    var listaLinhasProximasPartida = melhorPontoLinha(pontoPartida);
    var listaLinhasProximasChegada = melhorPontoLinha(pontoChegada);
    var out = "";

    var idLinha = 0;

    out = "<table style='width: 50%; float:left'><tr><th>Linhas próximas a <span class='cor-origem'>partida</span></th></tr>";

    //Exibe todas as linhas
    for (var i = 0; i < listaLinhasProximasPartida.length; i++) {
        idLinha = listaLinhasProximasPartida[i].linha;
        out += "<tr><td onClick='selecionaLinha(this,\"baldeacao-partida\"," + idLinha + ")'>" + obj.Linhas[idLinha].nome + "</td></tr>";
    }

    out += "</table>";
    listaMelhoresLinhas.innerHTML = out;

    out = "<table style='width: 50%; float:left'><tr><th>Linhas próximas a <span class='cor-destino'>chegada</span></th></tr>";

    //Exibe todas as linhas
    for (var i = 0; i < listaLinhasProximasChegada.length; i++) {
        idLinha = listaLinhasProximasChegada[i].linha;
        out += "<tr><td onClick='selecionaLinha(this,\"baldeacao-chegada\"," + idLinha + ")'>" + obj.Linhas[idLinha].nome + "</td></tr>";
    }

    out += "</table><button style='width: 100%' onclick='mudarEstadoPlanejadorViajens(\"partida-chegada\")'>Voltar para melhores linhas </button>";
    listaMelhoresLinhas.innerHTML += out;

}

/*
    == == Fim dos geradores de tabelas == ==
*/

var linhaSelecionadaPartida = "";
var antigaLinhaSelecionadaPartida = "";

var linhaSelecionadaPartidaChegada = "";
var antigaLinhaSelecionadaPartidaChegada = "";

var linhaSelecionadaBaldeacaoPartida = "";
var antigaLinhaSelecionadaBaldeacaoPartida = "";

var linhaSelecionadaBaldeacaoChegada = "";
var antigaLinhaSelecionadaBadeacaoChegada = "";

/*
    @param elementLinha: elemento DOM que corresponde a linha clicada
    @param tipoLinhaSelecionada: partida, partida-chegada, baldeacao-partida, baldeacao-chegada
*/
function selecionaLinha(elementLinha, tipoLinhaSelecionada, idLinha) {

    switch (tipoLinhaSelecionada) {
        case "partida":

            antigaLinhaSelecionadaPartida = linhaSelecionadaPartida;
            linhaSelecionadaPartida = elementLinha;

            linhaSelecionadaPartida.setAttribute("class", "linha-selecionada-partida");

            if (antigaLinhaSelecionadaPartida !== "") {
                antigaLinhaSelecionadaPartida.removeAttribute("class");
            }

            //Verifica se a linha é a mesma de antes
            if (antigaLinhaSelecionadaPartida == linhaSelecionadaPartida) {
                removePontosLinha();
            } else {
                desenhaPontosLinha(tipoLinhaSelecionada, idLinha);
            }

            break;

        case "partida-chegada":

            antigaLinhaSelecionadaPartidaChegada = linhaSelecionadaPartidaChegada;
            linhaSelecionadaPartidaChegada = elementLinha;

            linhaSelecionadaPartidaChegada.setAttribute("class", "linha-selecionada-partida");

            if (antigaLinhaSelecionadaPartidaChegada !== "") {
                antigaLinhaSelecionadaPartidaChegada.removeAttribute("class");
            }

            //Verifica se a linha é a mesma de antes
            if (antigaLinhaSelecionadaPartidaChegada == linhaSelecionadaPartidaChegada) {
                removePontosLinha();
            } else {
                desenhaPontosLinha(tipoLinhaSelecionada, idLinha);
            }

            break;

        case "baldeacao-partida":

            antigaLinhaSelecionadaBaldeacaoPartida = linhaSelecionadaBaldeacaoPartida;
            linhaSelecionadaBaldeacaoPartida = elementLinha;

            linhaSelecionadaBaldeacaoPartida.setAttribute("class", "linha-selecionada-partida");

            if (antigaLinhaSelecionadaBaldeacaoPartida !== "") {
                antigaLinhaSelecionadaBaldeacaoPartida.removeAttribute("class");
            }

            //Verifica se a linha é a mesma de antes
            if (antigaLinhaSelecionadaBaldeacaoPartida == linhaSelecionadaBaldeacaoPartida) {
                removePontosLinha();
            } else {
                desenhaPontosLinha(tipoLinhaSelecionada, idLinha);
            }

            break;

        case "baldeacao-chegada":

            antigaLinhaSelecionadaBaldeacaoChegada = linhaSelecionadaBaldeacaoChegada;
            linhaSelecionadaBaldeacaoChegada = elementLinha;

            linhaSelecionadaBaldeacaoChegada.setAttribute("class", "linha-selecionada-chegada");

            if (antigaLinhaSelecionadaBaldeacaoChegada !== "") {
                antigaLinhaSelecionadaBaldeacaoChegada.removeAttribute("class");
            }

            //Verifica se a linha é a mesma de antes
            if (antigaLinhaSelecionadaBaldeacaoChegada == linhaSelecionadaBaldeacaoChegada) {
                removePontosLinha();
            } else {
                desenhaPontosLinha(tipoLinhaSelecionada, idLinha);
            }

            break;
    }

    /*
    if (tipoLinhaSelecionada == "partida") {

        antigaLinhaSelecionadaPartida = linhaSelecionadaPartida;
        linhaSelecionadaPartida = elementLinha;

        linhaSelecionadaPartida.setAttribute("class", "linha-selecionada-partida");

        if (antigaLinhaSelecionadaPartida != "") {
            antigaLinhaSelecionadaPartida.removeAttribute("class");
        }

        //Verifica se a linha é a mesma de antes
        if (antigaLinhaSelecionadaPartida == linhaSelecionadaPartida) {
            removeLinha(tipoLinhaSelecionada);
        } else {
            desenhaLinhaX(tipoLinhaSelecionada);
        }

    } else if (tipoLinhaSelecionada == "chegada") {

        antigaLinhaSelecionadaChegada = linhaSelecionadaChegada;
        linhaSelecionadaChegada = elementLinha;

        linhaSelecionadaChegada.setAttribute("class", "linha-selecionada-chegada");

        if (antigaLinhaSelecionadaPartida != "") {
            antigaLinhaSelecionadaChegada.removeAttribute("class");
        }

        //Verifica se a linha é a mesma de antes
        if (antigaLinhaSelecionadaChegada == linhaSelecionadaChegada) {
            alert("remover linha selecionada chegada");
        } else {
            desenhaLinhaX(tipoLinhaSelecionada);
        }

    }*/
}

function desenhaPontosLinha(tipoLinhaSelecionada, idLinha) {

    /*
    switch (tipoLinhaSelecionada) {
        case "partida":
            break;

        case "partida-chegada":
            break;

        case "baldeacao-partida":
            break;

        case "baldeacao-chegada":
            break;
    }*/

    desenhaLinha(idLinha);

    //alert("desenha " + tipoLinhaSelecionada + " " + idLinha + " " + obj.Linhas[idLinha].nome);
}

function removePontosLinha() {

    //Remove a layer antiga com os marcadores
    map.removeLayer(markers);
    markers = new L.FeatureGroup();
}

function desenhaLinha(idLinha) {

    //Remove a layer antiga com os marcadores
    map.removeLayer(markers);
    markers = new L.FeatureGroup();

    //Adiciona a nova layer ao mapa
    map.addLayer(markers);

    //Percorre todos os pontos
    for (var i = 0; i < obj.Linhas[idLinha].sentidos[0].pontos.length; i++) {

        var marker = L.marker([obj.Linhas[idLinha].sentidos[0].pontos[i].lat, obj.Linhas[idLinha].sentidos[0].pontos[i].long], {
            icon: busIcon
        });

        //Adiciona o ponto no mapa
        markers.addLayer(marker);
    }

}
