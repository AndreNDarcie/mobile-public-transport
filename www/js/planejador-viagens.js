/*
	PLANEJADOR DE VIAGENS
*/

/* pontoAtual = "Partida" ou "Chegada" */
var pontoAtual = "";
var mensagem = document.getElementById("mensagem-planejador-viagens");
var listaMelhoresLinhas = document.getElementById("lista-melhores-linhas");
var baldeacaoAtiva = false;

var markers = new L.FeatureGroup();

var busIconOrigem = L.icon({
    iconUrl: 'img/marcador_blue.png',
    iconRetinaUrl: 'img/marcador_blue.png',
    iconSize: [25, 41],
    iconAnchor: [17, 41],
    popupAnchor: [-5, -40]
});

var busIconDestino = L.icon({
    iconUrl: 'img/marcador_red.png',
    iconRetinaUrl: 'img/marcador_red.png',
    iconSize: [25, 41],
    iconAnchor: [17, 41],
    popupAnchor: [-5, -40]
});

/* Ponto de partida e de chegada como marcador */
var marcadorPartida = L.marker([0, 0]);
var marcadorChegada = L.marker([0, 0]);

/* Ponto de partida e de chegada */
var pontoPartida;
var pontoChegada;


function iniciarPlanejadorViagens(){

	document.getElementById("menu-principal").style.display = 'none';
	document.getElementById("comboLinhas").style.display = 'none';
	document.getElementById("origemDestino").style.display = 'none';
	document.getElementById("fav").style.display = 'none';

	document.getElementById("planejador-viagens").style.display = 'block';
	mensagem.style.display = 'block';

	mensagem.innerHTML = "<div><span class='icon'>i</span>Toque no mapa para escolher o ponto de <span class='cor-origem'>partida</span>!</div>" +
	                     "<div style='font-size: 90%;'><input type='checkbox' value='GPS'> Local atual </div>" ;
}

map.on('click', function (e) {

	marcadorDinamico = e.latlng;

	if (!baldeacaoAtiva){

		listaMelhoresLinhas.innerHTML = "";

		if (pontoAtual == ""){
			marcadorPartida = L.marker(marcadorDinamico, { icon: busIconOrigem }).addTo(map)
			.bindPopup("<span class='cor-origem'>Partida</span>");

			pontoPartida = marcadorDinamico;
			mudarEstadoPlanejadorViajens("partida");

			pontoAtual = "Partida";


		} else if (pontoAtual == "Partida"){
			marcadorChegada = L.marker(marcadorDinamico, { icon: busIconDestino }).addTo(map)
			.bindPopup("<span class='cor-destino'>Chegada</span>");

			pontoChegada = marcadorDinamico;
			mudarEstadoPlanejadorViajens("partida-chegada");
			pontoAtual = "Chegada";

		} else if (pontoAtual == "Chegada"){

			map.removeLayer(marcadorPartida);
			map.removeLayer(marcadorChegada);

			mensagem.style.height = '32px';
			mensagem.innerHTML = "<div><span class='icon'>i</span>Toque no mapa para escolher o ponto de <span class='cor-origem'>partida</span>!</div>" +
								 "<div style='font-size: 90%;'><input type='checkbox' value='GPS'> Local atual </div>" ;
			pontoAtual = "";
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

	switch (estadoAtual){
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

	out  += "</table>";
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

	out  += "</table>";
	listaMelhoresLinhas.innerHTML = out;

	out = "<table style='width: 50%; float:left'><tr><th>Linhas próximas a <span class='cor-destino'>chegada</span></th></tr>";

	//Exibe todas as linhas
	for (var i = 0; i < listaLinhasProximasChegada.length; i++) {
	    idLinha = listaLinhasProximasChegada[i].linha;
	    out += "<tr><td onClick='selecionaLinha(this,\"baldeacao-chegada\"," + idLinha + ")'>" + obj.Linhas[idLinha].nome + "</td></tr>";
	}

	out  += "</table><button style='width: 100%' onclick='mudarEstadoPlanejadorViajens(\"partida-chegada\")'>Voltar para melhores linhas </button>";
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

            if (antigaLinhaSelecionadaPartida != "") {
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

            if (antigaLinhaSelecionadaPartidaChegada != "") {
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

            if (antigaLinhaSelecionadaBaldeacaoPartida != "") {
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

            if (antigaLinhaSelecionadaBaldeacaoChegada != "") {
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

        var marker = L.marker([obj.Linhas[idLinha].sentidos[0].pontos[i].lat, obj.Linhas[idLinha].sentidos[0].pontos[i].long], { icon: busIcon });

        //Adiciona o ponto no mapa
        markers.addLayer(marker);
    }

}
