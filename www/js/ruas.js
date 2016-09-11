//Le o JSON do arquivo database.json
var obj = pontosDB;

var listaLinhas = document.getElementById("linhas");
listaLinhas.onclick = function() {
    selecionarLinha(event);
};

function selecionarLinha(event) {
    var target = event.target || event.srcElement;
    sessionStorage.setItem('linha-selecionada', event.target.innerHTML);
    window.open("index.html", "_self");
}

function geraLinhas() {

    //var child = document.getElementById("p1");
    //parent.removeChild();

    var list = listaLinhas;

    if (list.hasChildNodes()) {
        for (var i = 0; i < list.childNodes.length; i++) {
            list.removeChild(list.childNodes[i]);

        }
    }

    //Pega a linha selecionada
    var x = document.getElementById("combobox_ruas1");
    var itemSelecionado = x.options[x.selectedIndex].value;
    console.log(itemSelecionado);

    for (var a = 0; a < obj.Linhas.length; a++) {
        for (var b = 0; b < obj.Linhas[a].sentidos[0].pontos.length; b++) {

            console.log(obj.Linhas[a].sentidos[0].pontos[b].rua + " == " + itemSelecionado);

            if (obj.Linhas[a].sentidos[0].pontos[b].rua == itemSelecionado) {

                var texto = "";

                texto = obj.Linhas[a].nome + " - " + obj.Linhas[a].tipo + " - Sentido: " + obj.Linhas[a].sentidos[0].sentido;
                //obj.Linhas[l].sentidos[0].pontos[i].numero

                var node = document.createElement("li");

                var textnode = document.createTextNode(texto);
                node.appendChild(textnode);
                document.getElementById("linhas").appendChild(node);

                //Proxima linha
                a++;

                break;

            }
        }

    }

}
