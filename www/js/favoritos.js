var botaoFavorito = document.getElementById("fav");
var comboLinhas = document.getElementById("comboLinhas");

//var listaFavoritos = document.getElementById("lista-favoritos");

//listaFavoritos.onclick = function () { selecionarLinha(event) };

exibirLinhas();

function selecionarLinha(event) {
    var target = event.target || event.srcElement;
    sessionStorage.setItem('linha-selecionada', event.target.innerHTML);
    window.open("index.html", "_self");
}

function exibirLinhas() {
    //subMenu_linhas.style.backgroundColor = "#3388CC";
    //subMenu_linhas.style.color = "#FFF";
    //subMenu_ruas.style.backgroundColor = "#EFEFEF";
    //subMenu_ruas.style.color = "#000";

    var ul = document.getElementById("lista-favoritos");

    //ul.innerHTML = '';
    var indice = sessionStorage.getItem('indice-favoritos');

    for (var i = 0; i < indice; i++) {
        if (sessionStorage.getItem(i) !== null) {
            var li = document.createElement("li");
            li.appendChild(document.createTextNode(sessionStorage.getItem(i)));
            ul.appendChild(li);
        }
    }

    /*
	li.appendChild(document.createTextNode("Linha " + cont));
	ul.appendChild(li);
	cont++;
    */
}

botaoFavorito.onclick = function() {
    favoritarLinha();
};
comboLinhas.onclick = function() {
    desenhaBotao();
};

function desenhaBotao() {

    //Pega a linha selecionada no HTML
    var x = document.getElementById("comboLinhas");
    l = x.options[x.selectedIndex].value;
    var nomeLinha = obj.Linhas[l].nome;

    if (verificaExistLinha(nomeLinha)) {
        botaoFavorito.innerHTML = "✮";
    } else {
        botaoFavorito.innerHTML = "✰";
    }
}

/* Adicionar linha na lista dos favoritos */
function favoritarLinha() {


    botaoFavorito.innerHTML = "✮";

    //localStorage.setItem("dadosJogo", JSON.stringify(dadosJogo));

    //Recupera a lista de linhas favoritas
    var listaFavoritos = [];
    listaFavoritos = JSON.parse(localStorage.getItem("lista-favoritos"));

    //Pega a linha selecionada no HTML
    var x = document.getElementById("comboLinhas");
    l = x.options[x.selectedIndex].value;
    var nomeLinha = obj.Linhas[l].nome;

    //Verifica se a lista esta vazia
    if (isEmpty(listaFavoritos)) {
        listaFavoritos.push(nomeLinha);

    } else {

        //Verifica se a linha já existe
        if (verificaExistLinha(nomeLinha)) {
            remove(listaFavoritos, nomeLinha);
            botaoFavorito.innerHTML = "✰";

        } else {
            listaFavoritos.push(nomeLinha);

        }

    }

    //Salva a alteracao
    localStorage.setItem("lista-favoritos", JSON.stringify(listaFavoritos));

    exibirLista();
    /*
    var indiceJaExiste = 0;

    //Pega a linha selecionada no HTML
    var x = document.getElementById("comboLinhas");
    l = x.options[x.selectedIndex].value;

    //alert(obj.Linhas[l].nome);

    var indice = sessionStorage.getItem('indice-favoritos');
    var jaExiste = false;

    for (var i = 0; i < indice; i++) {
        if (sessionStorage.getItem(i) == obj.Linhas[l].nome) {
            jaExiste = true;
            indiceJaExiste = i;
        }
    }

    if (jaExiste == false) {
        sessionStorage.setItem(indice, obj.Linhas[l].nome);
        indice++;
        sessionStorage.setItem('indice-favoritos', indice);
    } else {
        sessionStorage.removeItem(indiceJaExiste);
        botaoFavorito.innerHTML = "✰";
        jaExiste = false;
    }
	*/
}

//Verifica se a linha já esta na lista de favoritos
function verificaExistLinha(nomeLinha) {

    var listaFavoritos = JSON.parse(localStorage.getItem("lista-favoritos"));

    for (var i = 0; i < listaFavoritos.length; i++) {
        if (nomeLinha == listaFavoritos[i]) {
            return true;
        }
    }

    return false;
}

//Remove certo item da lista
function remove(arr, item) {
    for (var i = arr.length; i--;) {
        if (arr[i] === item) {
            arr.splice(i, 1);
        }
    }
}

//Verifica se a lista esta vazia
function isEmpty(obj) {
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}

//Exibe a linha
function exibirLista() {
    console.log("-------------------------------");
    var listaFavoritos = JSON.parse(localStorage.getItem("lista-favoritos"));
    for (var i = 0; i < listaFavoritos.length; i++) {
        console.log(i + " " + listaFavoritos[i]);
    }
}
