//configuracoes da interface
//var menuLinhas = document.getElementById("btn_linhas");
//menuLinhas.style.backgroundColor = "#3388CC";
//menuLinhas.style.color = "#FFF";

//Variaveis globais
//sessionStorage.setItem('indice-favoritos', 0);

//Le o JSON do arquivo database.json
var obj = pontosDB;

var busIcon = L.icon({
    iconUrl: 'img/marcador.png',
    iconRetinaUrl: 'img/marcador.png',
    iconSize: [25, 41],
    iconAnchor: [17, 41],
    popupAnchor: [-5, -40]
});

var busIconRed = L.icon({
    iconUrl: 'img/dot_pointer_red.png',
    iconRetinaUrl: 'img/dot_pointer_red.png',
    iconSize: [15, 15],
    iconAnchor: [7, 15],
    popupAnchor: [-5, -40]
});

var busIconBlue = L.icon({
    iconUrl: 'img/dot_pointer_blue.png',
    iconRetinaUrl: 'img/dot_pointer_blue.png',
    iconSize: [15, 15],
    iconAnchor: [7, 15],
    popupAnchor: [-5, -40]
});

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

var busIconProximo = L.icon({
    iconUrl: 'img/marcador_cinza.png',
    iconRetinaUrl: 'img/marcador_cinza.png',
    iconSize: [25, 41],
    iconAnchor: [17, 41],
    popupAnchor: [-5, -40]
});

desenhaOptions();
iniciarMapa();

var map;
var marcadorDinamico;
var querySQL;

// testes:
var mark1 = L.marker([0, 0]);
var mark2 = L.marker([0, 0]);
var mark3 = L.marker([0, 0]);
var mark4 = L.marker([0, 0]);
var mark5 = L.marker([0, 0]);
// fim teste;

var linhaSelecionada = -1;

if (sessionStorage.getItem('linha-selecionada') !== null) {
    console.log(sessionStorage.getItem('linha-selecionada'));

    for (var i = 0; i < obj.Linhas.length; i++) {
        if (sessionStorage.getItem('linha-selecionada') == obj.Linhas[i].nome) {
            sessionStorage.setItem('linha-selecionada', null);
            document.getElementById(i).selected = true;
            //desenhaLinha(-1, -1, -1, false, '0');
            break;
        }
    }


}

function desenhaOptions() {
    var select = document.getElementById('comboLinhas');
    var nomeLinhas = [];

    for (var i = 0; i < obj.Linhas.length; i++) {
        nomeLinhas.push(obj.Linhas[i].tipo + " - " + obj.Linhas[i].nome);
    }

    /*
    var nomeLinhas = ["A001 - CIRCULAR CENTRO / TURISMO", "F208 - BAIRRO SOUZA LIMA / ESTAÇÃO CENTRAL", "F306 - INTEGRAÇÃO FAZENDA / ESTAÇÃO CENTRAL",
		"LE 01 - PUC / PITÁGORAS", "LE 02 - UNIFAL / PITÁGORAS", "N11 - CORUJÃO COHAB", "N23 - CORUJÃO P. PRETA / P. COBERTA (SENTIDO P.COBERTA)",
	    "N23 - CORUJÃO P. PRETA / P. COBERTA (SENTIDO P.PRETA)", "P21 - ESTAÇÃO SUL / ESTAÇÃO VILA NOVA", "P21 - ESTAÇÃO VILA NOVA / ESTAÇÃO SUL",
	    "P21 - ESTAÇÃO VILA NOVA / ESTAÇÃO SUL"]
    */

    for (var i = 0; i < nomeLinhas.length; i++) {
        var opt = document.createElement('option');
        opt.value = +i;
        opt.innerHTML = nomeLinhas[i];
        opt.id = opt.value;
        select.appendChild(opt);
    }
}

var botaoFavorito = document.getElementById("fav");
var comboLinhas = document.getElementById("comboLinhas");

comboLinhas.onclick = function() {
    desenhaBotaoFavoritos(), desenhaLinha(-1, -1, -1, false, '0')
};

function desenhaBotaoFavoritos() {

    var indice = sessionStorage.getItem('indice-favoritos');
    var jaExiste = false;

    //Pega a linha selecionada no HTML
    var x = document.getElementById("comboLinhas");
    l = comboLinhas.options[x.selectedIndex].value;

    for (var i = 0; i < indice; i++) {
        if (sessionStorage.getItem(i) == obj.Linhas[l].nome) {
            jaExiste = true;
        }
    }

    if (jaExiste === true) {
        botaoFavorito.innerHTML = "✮";
    } else {
        botaoFavorito.innerHTML = "✰";
        jaExiste = false;
    }
}

function iniciarMapa() {
    map = L.map("mapa").setView([-21.786, -46.566], 16);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(map);

    map.invalidateSize();
}

function Ponto(_rua, _lat, _long) {
    this.Rua = _rua;
    this.Lat = _lat;
    this.Long = _long;
}

var markers = new L.FeatureGroup();

/*
function desenhaLinha() {

    //Pega a linha selecionada
    var x = document.getElementById("comboLinhas");
    var itemSelecionado = x.options[x.selectedIndex].value;

    //Remove a layer antiga com os marcadores
    map.removeLayer(markers);
    markers = new L.FeatureGroup();

    //Adiciona a nova layer ao mapa
    map.addLayer(markers);

    querySQL = 'SELECT * FROM PONTOS WHERE idLinha = ' + itemSelecionado;
    //console.log('SELECT * FROM PONTOS WHERE idLinha = ' + itemSelecionado);
    var db = window.openDatabase("Database", "1.0", "Cordova Demo", 200000);
    db.transaction(queryDB, errorCB);
}
*/

var marcadorOrigem = L.marker([0, 0]);
var marcadorDestino = L.marker([0, 0]);
var pontoOrigem;
var pontoDestino;
var origemDestino = "Destino";
var pontos = 0;
var posicaoOrigem;

/*
map.on('click', function (e) {

    marcadorDinamico = e.latlng;


    if (pontos == 2) {
        pontos = 0;
        map.removeLayer(marcadorOrigem);
        map.removeLayer(marcadorDestino);
    }

    if (origemDestino == "Destino") {
        origemDestino = "Origem";
        pontoOrigem = e.latlng;

        marcadorOrigem = L.marker(marcadorDinamico, { icon: busIconOrigem }).addTo(map)
            .bindPopup("Origem");
        console.log(e.latlng);

        posicaoOrigem = marcadorDinamico;

        pontos++;

    } else {
        origemDestino = "Destino";
        pontoDestino = e.latlng;

        var todasLinhas = [];
        todasLinhas = leitor();

        marcadorDestino = L.marker(marcadorDinamico, { icon: busIconDestino }).addTo(map)
            .bindPopup(desenhaPopUpPontoOrigemDestino("destino", todasLinhas));
        console.log(e.latlng);
        pontos++;

        map.removeLayer(marcadorOrigem);
        marcadorOrigem = L.marker(posicaoOrigem, { icon: busIconOrigem }).addTo(map)
            .bindPopup(desenhaPopUpPontoOrigemDestino("origem", todasLinhas));
        console.log(e.latlng);

    }

});
*/

//Função que desenha o popup do ponto
function desenhaPopUpPontoOrigemDestino(alvo, todasLinhas) {

    var out = "";

    if (alvo == "origem") {

        var linhasProximasOrigem = todasLinhas.linhasProximasOrigem;

        out = "<p style=\"text-align: center; font-size: 30px; color: #3498db; \">Origem</p>";

        /* Desenha a tabela com as linhas proximas a origem */

        out += "<table style=\"background-color: #F3F3F2; width:100%; text-align: center;\"> " +
            "<tr style=\"background-color: #3498db; color: white;\"> <th>Linhas Prox Origem</th> <th>Tempo Total em minutos</th> </tr>";

        for (var i = 0; i < linhasProximasOrigem.length; i++) {
            if (linhasProximasOrigem[i].baldeacao) {
                out += "<tr style=\"background-color: #E6E6E6; cursor: pointer;\"><td onClick=\"desenhaLinha(" + linhasProximasOrigem[i].linha + "," + linhasProximasOrigem[i].pontoOrigem + "," + linhasProximasOrigem[i].pontoDestino + "," + true + ",1)\">" + obj.Linhas[linhasProximasOrigem[i].linha].nome + "</td> <td>" + parseInt(linhasProximasOrigem[i].distancia) + "</td> </tr>";
            }
        }

        out += "</table> <div style=\"height: 20px;\"></div>";

    } else if (alvo == "destino") {

        var linhasOrigemDestino = todasLinhas.linhasOrigemDestino;
        var linhasProximasDestino = todasLinhas.linhasProximasDestino;

        out = "<p style=\"text-align: center; font-size: 30px; color: #3498db; \">Destino</p>";

        /* Desenha a tabela com as linhas proximas a origem e destino */

        out += "<table style=\"background-color: #F3F3F2; width:100%; text-align: center;\"> " +
            "<tr style=\"background-color: #3498db; color: white;\"> <th>Melhores linhas</th> <th>Tempo Total em minutos</th> </tr>";

        for (var i = 0; i < linhasOrigemDestino.length; i++) {
            out += "<tr style=\"background-color: #E6E6E6; cursor: pointer;\"><td onClick=\"desenhaLinha(" + linhasOrigemDestino[i].linha + "," + linhasOrigemDestino[i].pontoOrigem + "," + linhasOrigemDestino[i].pontoDestino + "," + false + ",0)\">" + linhasOrigemDestino[i].nome + "</td> <td>" + parseInt(linhasOrigemDestino[i].distanciaTotal) + " - " + linhasOrigemDestino[i].pontoDestino + "</td> </tr>";
        }

        out += "</table> <div style=\"height: 5px;\"></div>";

        /* Desenha a tabela com as linhas proximas a destino */

        out += "<table style=\"background-color: #F3F3F2; width:100%; text-align: center;\"> " +
            "<tr style=\"background-color: #3498db; color: white;\"> <th>Linhas Prox Destino</th> <th>Tempo Total em minutos</th> </tr>";

        for (var i = 0; i < linhasProximasDestino.length; i++) {
            if (linhasProximasDestino[i].baldeacao) {
                out += "<tr style=\"background-color: #E6E6E6; cursor: pointer;\"><td onClick=\"desenhaLinha(" + linhasProximasDestino[i].linha + "," + linhasProximasDestino[i].pontoOrigem + "," + linhasProximasDestino[i].pontoDestino + "," + true + ",2)\">" + obj.Linhas[linhasProximasDestino[i].linha].nome + "</td> <td>" + parseInt(linhasProximasDestino[i].distancia) + "</td> </tr>";
            }
        }

        out += "</table> <div style=\"height: 20px;\"></div>";
    }

    return out;
}



//NOVO CODIGO PARA A TRANSFERENCIA PARA O JSON.

/*
Função responsavel por desenhar no mapa a linha selecionada
buscando as informações no arquivo JSON.
 */
var numLinhasDesenhadas = 0;

function desenhaLinha(flagLinha, PontoOrigem, PontoDestino, tipoBaldeacao, quem) {

    var l = 0;

    if (flagLinha >= 0) {
        l = flagLinha;
        document.getElementById(flagLinha).selected = true;

        if (tipoBaldeacao === true) {
            if (quem == "1") {
                document.getElementById("origemLinha").innerHTML = obj.Linhas[flagLinha].nome;
            } else if (quem == "2") {
                document.getElementById("destinoLinha").innerHTML = obj.Linhas[flagLinha].nome;
            }
        }

    } else {
        //Pega a linha selecionada no HTML
        var x = document.getElementById("comboLinhas");
        l = x.options[x.selectedIndex].value;
    }

    /*
    var indice = sessionStorage.getItem('indice-favoritos');
    var jaExiste = false;

    for (var i = 0; i < indice; i++) {
        if (sessionStorage.getItem(i) == obj.Linhas[l].nome) {
            jaExiste = true;
        }
    }

    if (jaExiste == false) {
        sessionStorage.setItem(indice, obj.Linhas[l].nome);
        indice++;
        sessionStorage.setItem('indice-favoritos', indice);
    } else {
        jaExiste = false;
    }
    */

    if (tipoBaldeacao === true) {
        switch (numLinhasDesenhadas) {
            case 0:

                //Remove a layer antiga com os marcadores
                map.removeLayer(markers);
                markers = new L.FeatureGroup();
                numLinhasDesenhadas++;
                break;
            case 1:
                numLinhasDesenhadas++;
                break;
            case 2:
                numLinhasDesenhadas = 0;

                //Remove a layer antiga com os marcadores
                map.removeLayer(markers);
                markers = new L.FeatureGroup();

                break;
        }

    } else {
        //Remove a layer antiga com os marcadores
        map.removeLayer(markers);
        markers = new L.FeatureGroup();
    }

    //Adiciona a nova layer ao mapa
    map.addLayer(markers);

    //Percorre todos os pontos
    for (var i = 0; i < obj.Linhas[l].sentidos[0].pontos.length; i++) {

        if (PontoOrigem == obj.Linhas[l].sentidos[0].pontos[i].id) {
            var marker = L.marker([obj.Linhas[l].sentidos[0].pontos[i].lat, obj.Linhas[l].sentidos[0].pontos[i].long], {
                    icon: busIconProximo
                })
                .bindPopup(desenhaPopUpPontoLinha(1, l, i));

        } else if (PontoDestino == obj.Linhas[l].sentidos[0].pontos[i].id) {
            var marker = L.marker([obj.Linhas[l].sentidos[0].pontos[i].lat, obj.Linhas[l].sentidos[0].pontos[i].long], {
                    icon: busIconProximo
                })
                .bindPopup(desenhaPopUpPontoLinha(2, l, i));
        } else {
            if (quem == 1) {
                var marker = L.marker([obj.Linhas[l].sentidos[0].pontos[i].lat, obj.Linhas[l].sentidos[0].pontos[i].long], {
                        icon: busIconBlue
                    })
                    .bindPopup(desenhaPopUpPontoLinha(0, l, i));
            } else if (quem == 2) {
                var marker = L.marker([obj.Linhas[l].sentidos[0].pontos[i].lat, obj.Linhas[l].sentidos[0].pontos[i].long], {
                        icon: busIconRed
                    })
                    .bindPopup(desenhaPopUpPontoLinha(0, l, i));
            } else {
                var marker = L.marker([obj.Linhas[l].sentidos[0].pontos[i].lat, obj.Linhas[l].sentidos[0].pontos[i].long], {
                        icon: busIcon
                    })
                    .bindPopup(desenhaPopUpPontoLinha(0, l, i));
            }
        }

        //Adiciona o ponto criado ao mapa
        markers.addLayer(marker);
    }
}

function desenhaPopUpPontoLinha(tipoPonto, linha, idPonto) {

    var out = "";

    /*
     * -= tipoPonto =-
     * 0 - comum
     * 1 - proximo origem
     * 2 - proximo destino
     * 3 - desembarque baldeaçao
     * 4 - embarque baldeação
     *
     */

    switch (tipoPonto) {
        case 1: //proximo origem
            out = "<p style=\"text-align: center; font-size: 20px; color: blue; \">Próximo Origem</p>";
            break;
        case 2: //proximo destino
            out = "<p style=\"text-align: center; font-size: 20px; color: red; \">Próximo Destino</p>";
            break;
        case 3: //desembarque baldeaçao
            out = "<p style=\"text-align: center; font-size: 20px; color: blue; \">Desembarque baldeaçao</p>";
            break;
        case 4: //embarque baldeação
            out = "<p style=\"text-align: center; font-size: 20px; color: red; \">Embarque baldeaçao</p>";
            break;
    }

    out += " Id: " + obj.Linhas[linha].sentidos[0].pontos[idPonto].id + " " + obj.Linhas[linha].sentidos[0].pontos[idPonto].bairro + " | " +
        obj.Linhas[linha].sentidos[0].pontos[idPonto].rua + ", " + obj.Linhas[linha].sentidos[0].pontos[idPonto].numero;

    out += "<table style=\"background-color: #F3F3F2; width:100%; text-align: center;\"> ";
    out += "<tr style=\"background-color: #3498db; color: white;\"> <th>Prefixo</th> <th>Horarios</th> <th>Sentido</th> </tr>";

    for (var i = 0; i < 4; i++) {
        out += "<tr> <td>" + obj.Linhas[linha].sentidos[0].pontos[idPonto].numero + "</td> <td>" + obj.Linhas[linha].sentidos[0].pontos[idPonto].horariosSegSex[i] +
            "</td> <td>" + obj.Linhas[linha].sentidos[0].pontos[idPonto].bairro + "</td> </tr>";
    }

    out += "</table>";
    out += "<div style=\"height: 20px;\"></div>";

    return out;
}


//Testes com o novo JSON
function leitor() {

    var linhasProximasOrigem = melhorPontoLinha(pontoOrigem);
    var linhasProximasDestino = melhorPontoLinha(pontoDestino);

    var quantidadeLinhas = 3;

    var linhasOrigemDestino = [];
    var i = 0;

    for (var x = 0; x < quantidadeLinhas; x++) {
        for (var y = 0; y < quantidadeLinhas; y++) {
            if (linhasProximasOrigem[x].linha == linhasProximasDestino[y].linha) {
                linhasProximasOrigem[x].baldeacao = 0;
                linhasProximasDestino[y].baldeacao = 0;
                linhasOrigemDestino[i] = {
                    linha: linhasProximasOrigem[x].linha,
                    nome: obj.Linhas[linhasProximasOrigem[x].linha].nome,
                    pontoOrigem: linhasProximasOrigem[x].pontoId,
                    pontoDestino: linhasProximasDestino[y].pontoId,
                    distanciaTotal: (linhasProximasOrigem[x].distancia + linhasProximasDestino[y].distancia)
                };
                i++;
                console.log("LinhaProxOrigem: " + linhasProximasOrigem[x].linha + " - linhaProxDestino: " + linhasProximasDestino[y].linha + "-  linhasOrigem: " + linhasProximasOrigem[x].distancia + " linhasDestino: " + linhasProximasDestino[y].distancia + " total: " + (linhasProximasOrigem[x].distancia + linhasProximasDestino[y].distancia));
            }
        }
    }

    console.log("Linhas com pontos proximos a origem: ");
    for (var i = 0; i < quantidadeLinhas; i++) {
        if (linhasProximasOrigem[i].baldeacao == 1) {
            console.log("Linha: " + linhasProximasOrigem[i].linha + " - Distancia: " + linhasProximasOrigem[i].distancia + " - P Proximo: " + linhasProximasOrigem[i].pontoId);
        }
    }

    console.log("Linhas com pontos proximos a destino: ");
    for (var i = 0; i < quantidadeLinhas; i++) {
        if (linhasProximasDestino[i].baldeacao == 1) {
            console.log("Linha: " + linhasProximasDestino[i].linha + " - Distancia: " + linhasProximasDestino[i].distancia + " - P Destino: " + linhasProximasDestino[i].pontoId);
        }
    }



    linhasOrigemDestino.sort(function(a, b) {
        if (a.distanciaTotal < b.distanciaTotal)
            return -1;
        if (a.distanciaTotal > b.distanciaTotal)
            return 1;
        return 0;
    });

    //calcularTempo(linhasOrigemDestino);

    //var printLinhasOrigemDestino = [];

    //for (var i = 0; i < linhasOrigemDestino.length; i++) {
    //    console.log("N: " + linhasOrigemDestino[i].linha + " - linhasOrigemDestino: " + obj.Linhas[linhasOrigemDestino[i].linha].nome + " - distancia total: " + linhasOrigemDestino[i].distanciaTotal);
    //    printLinhasOrigemDestino[i] = { nome: obj.Linhas[linhasOrigemDestino[i].linha].nome, distanciaTotal: linhasOrigemDestino[i].distanciaTotal };
    //}
    calcularTempo(linhasOrigemDestino);
    var todasLinhas = {
        linhasOrigemDestino: linhasOrigemDestino,
        linhasProximasOrigem: linhasProximasOrigem,
        linhasProximasDestino: linhasProximasDestino
    }
    return todasLinhas;
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


function calcularTempo(linhasOrigemDestino) {

    //Horario atual:
    horaAtual = 09;
    minutoAtual = 30;
    var x = 0;
    var y = 0;
    var tempoTotal;

    for (; x < linhasOrigemDestino[x].length; x++) {

        while (linhasOrigemDestino[x].pontoOrigem != obj.Linhas[linhasOrigemDestino[x].linha].sentidos[0].pontos[y].id) {
            y++;
        }

        var indexPontoOrigem = y;
        y = 0;

        while (linhasOrigemDestino[x].pontoDestino != obj.Linhas[linhasOrigemDestino[x].linha].sentidos[0].pontos[y].id) {
            y++;
        }
        var indexPontoDestino = y;
        y = 0;

        while (indexPontoOrigem != indexPontoDestino) {

            var horario = obj.Linhas[linhasOrigemDestino[x].linha].sentidos[0].pontos[indexPontoOrigem].horariosSegSex[0];
            var hora = parseInt(horario[0] + horario[1]);
            var minuto = parseInt(horario[3] + horario[4]);
            tempoTotal += hora - horaAtual;
            indexPontoOrigem++;

        }
    }

    console.log("++++++++++++++ TempoTotal: " + tempoTotal);

    /*
    for (var i = 0; i < linhasOrigemDestino.length; i++) {

        //obj.Linhas[0].sentidos[0].pontos[0].horariosSegSex[0]

        var pontoOrigem = linhasOrigemDestino[i].pontoOrigem;
        var pontoDestino = linhasOrigemDestino[i].pontoDestino;

        var pontoAtual = pontoOrigem;

        while (pontoAtual != pontoDestino) {

            var horario = obj.Linhas[linhasOrigemDestino[i].linha].sentidos[0].pontos[pontoAtual].horariosSegSex[0];
            var hora = parseInt(horario[0] + horario[1]);
            var minuto = parseInt(horario[3] + horario[4]);

            if (hora > horaAtual) {
                console.log(hora - horaAtual);
            }
        }

        //console.log(obj.Linhas[linhasOrigemDestino[i].linha].sentidos[0].pontos[0].horariosSegSex[0]);

        var hora = parseInt(horario[0] + horario[1]);
        //horario[2] = ":"
        var minuto = parseInt(horario[3] + horario[4]);

        //console.log("Horas: " + hora + " - Minutos: " + minuto);

        if (hora > horaAtual) {
            //console.log(hora - horaAtual);
        } else {
            //console.log(hora - horaAtual);
        }



    }*/
}

function pegarHorarioAtual() {
    return "10:00";
}
