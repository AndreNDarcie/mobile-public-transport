iniciaApp();

function iniciaApp(){

  var comboLinhas = document.getElementById("comboLinhas");
  comboLinhas.onclick = function() {
      desenhaBotaoFavoritos();
      desenhaLinhaMain();
  };

}

function desenhaListaDeLinhas() {

    var i = 0;
    var select = document.getElementById('comboLinhas');
    var nomeLinhas = [];

    for (i = 0; i < obj.Linhas.length; i++) {
        nomeLinhas.push(obj.Linhas[i].tipo + " - " + obj.Linhas[i].nome);
    }

    for (i = 0; i < nomeLinhas.length; i++) {
        var opt = document.createElement('option');
        opt.value = +i;
        opt.innerHTML = nomeLinhas[i];
        opt.id = opt.value;
        select.appendChild(opt);
    }
}

function desenhaBotaoFavoritos() {

    var indice = sessionStorage.getItem('indice-favoritos');
    var botaoFavorito = document.getElementById("fav");
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

function desenhaLinhaMain() {

    //Pega a linha selecionada
    var x = document.getElementById("comboLinhas");
    var l = x.options[x.selectedIndex].value;

    //Remove a layer antiga com os marcadores
    map.removeLayer(markers);
    markers = new L.FeatureGroup();

    //Adiciona a nova layer ao mapa
    map.addLayer(markers);

    var numeroPontos = obj.Linhas[l].sentidos[0].pontos.length;

    //Percorre todos os pontos
    for (var i = 0; i < numeroPontos; i++) {

      var lat = obj.Linhas[l].sentidos[0].pontos[i].lat;
      var long = obj.Linhas[l].sentidos[0].pontos[i].long;

      var marker = L.marker([lat, long], {
        icon: busIcon
      }).bindPopup(desenhaPopUpPontoLinha(0, l, i));

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
