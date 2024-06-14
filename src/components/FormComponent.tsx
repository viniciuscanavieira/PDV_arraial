"use client";

import React, { useEffect, useState } from "react";
import { FaWhatsapp, FaRegTrashAlt } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Item {
  produtos: { nome: string; quantidade: number; preco: number }[];
  endereco: string;
  valor: number;
  metodoPagamento: string;
  foiPago: boolean;
  hora: string;
  foiEntregue: boolean;
}

const produtosDisponiveis = {
  Agua: 8.50,
  Gas: 110.0,
  CartelaDeOvos: 24.0,
};

export const FormComponent = () => {
  const [produtoSelecionado, setProdutoSelecionado] = useState("Agua");
  const [quantidade, setQuantidade] = useState(1);
  const [endereco, setEndereco] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("Pix");
  const [foiPago, setFoiPago] = useState(false);
  const [listaProdutos, setListaProdutos] = useState<{ nome: string; quantidade: number; preco: number }[]>([]);
  const [lista, setLista] = useState<Item[]>([]);

  useEffect(() => {
    const storedList = localStorage.getItem("lista");
    if (storedList) {
      setLista(JSON.parse(storedList));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lista", JSON.stringify(lista));
  }, [lista]);

  const getCurrentTime = () => {
    const date = new Date();
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  };

  const handleProdutoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setProdutoSelecionado(e.target.value);
  };

  const handleQuantidadeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantidade(Number(e.target.value));
  };

  const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndereco(e.target.value);
  };

  const handleMetodoPagamentoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMetodoPagamento(e.target.value);
  };

  const handleFoiPagoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFoiPago(e.target.checked);
  };

  const handleAdicionarProduto = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!produtoSelecionado || !quantidade || produtoSelecionado === "" || quantidade <= 0) {
      alert("Por favor, selecione um produto e quantidade válida!");
      return;
    }

    const preco = produtosDisponiveis[produtoSelecionado as keyof typeof produtosDisponiveis];
    const novoProduto = {
      nome: produtoSelecionado,
      quantidade,
      preco,
    };

    setListaProdutos([...listaProdutos, novoProduto]);
    setProdutoSelecionado("Agua");
    setQuantidade(1);
  };

  const handleAdicionarPedido = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (listaProdutos.length === 0 || !endereco) {
      alert("Por favor, adicione produtos e preencha o endereço!");
      return;
    }

    const valorTotal = listaProdutos.reduce((total, produto) => total + produto.quantidade * produto.preco, 0);
    const novoPedido: Item = {
      produtos: listaProdutos,
      endereco,
      valor: valorTotal,
      metodoPagamento,
      foiPago,
      hora: getCurrentTime(),
      foiEntregue: false,
    };

    setLista([...lista, novoPedido]);
    setListaProdutos([]);
    setEndereco("");
    setMetodoPagamento("Pix");
    setFoiPago(false);
  };

  const handleRemoverPedido = (index: number) => {
    const updatedLista = lista.filter((_, idx) => idx !== index);
    setLista(updatedLista);
  };

  const handleWhatsApp = (index: number) => {
    const item = lista[index];
    const numeroPedido = lista.length - index; // Calcular o número do pedido com base na posição inversa na lista
    const produtosMensagem = item.produtos.map(p => `${p.nome} - ${p.quantidade}x`).join("\n");
    const message = `*Novo Pedido *Número ${numeroPedido}*\nHora: ${item.hora}\n\n` +
                    `*Produtos Solicitados:*\n${produtosMensagem}\n\n` +
                    `*Endereço/Cliente:*\n${item.endereco}\n\n` +
                    `*Método de Pagamento:* ${item.metodoPagamento}\n` +
                    `*Valor Total:* R$ ${item.valor.toFixed(2)}\n\n` +
                    `*Detalhes do Pagamento:*\n` +
                    `- Foi Pago: ${item.foiPago ? "Sim" : "Não"}\n` +
                    `Por favor, confirme a entrega após a conclusão.\n`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/559885631906?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
};


  const totalPagamento = lista
    .filter((item) => item.foiPago)
    .reduce((total, item) => total + item.valor, 0);

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.text("Relatório do Dia", 14, 22);
    doc.text(
      `Data: ${
        new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) ?? ""
      }`,
      14,
      32
    );

    autoTable(doc, {
      head: [["Número do Pedido", "Produtos", "Endereço/Cliente", "Valor", "Pagamento", "Hora", "Pago", "Entregue"]],
      body: lista.map((item, index) => [
        lista.length - index,
        item.produtos.map(p => `${p.nome} (Qtd: ${p.quantidade})`).join(", "),
        item.endereco,
        `R$ ${item.valor.toFixed(2)}`,
        item.metodoPagamento,
        item.hora,
        item.foiPago ? "Sim" : "Não",
        item.foiEntregue ? "Sim" : "Não",
      ]),
      startY: 40,
      styles: { halign: 'center' },
    });

    autoTable(doc, {
      body: [
        [`Total Caixa: R$ ${totalPagamento.toFixed(2)}`],
      ],
      startY: (doc as any).lastAutoTable.finalY + 10,
      styles: { halign: 'center' },
    });

    doc.save(
      `Relatorio_${
        new Date().toLocaleDateString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }) ?? ""
      }.pdf`
    );
  };

  const handleIniciarNovoDia = () => {
    const userConfirmed = window.confirm(
      "Você tem certeza que deseja apagar a lista atual?"
    );
    if (userConfirmed) {
      setLista([]);
      localStorage.removeItem("lista");
    } else {
      return;
    }
  };

  const handleCheckboxChange = (index: number) => {
    const realIndex = lista.length - 1 - index;
    const novaLista = [...lista];
    novaLista[realIndex].foiPago = !novaLista[realIndex].foiPago;
    setLista(novaLista);
  };

  const handleEntregaChange = (index: number) => {
    const realIndex = lista.length - 1 - index;
    const novaLista = [...lista];
    novaLista[realIndex].foiEntregue = !novaLista[realIndex].foiEntregue;
    setLista(novaLista);
  };

  return (
    <div className="max-w-screen-lg mx-auto p-4">
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <h1 className="text-center text-2xl font-bold text-white mb-4">Adicionar Pedido</h1>
        <form onSubmit={handleAdicionarProduto} className="mb-4">
          <div className="flex flex-wrap justify-between">
            <div className="flex flex-col w-full md:w-1/2 p-2">
              <label className="font-semibold text-[#ffffff]">Produto:</label>
              <select
                className="border border-gray-300 focus:border-2 focus:border-[#1d3099] focus:outline-none bg-gray-700 p-2 text-white rounded"
                value={produtoSelecionado}
                onChange={handleProdutoChange}
              >
                {Object.keys(produtosDisponiveis).map((produto, idx) => (
                  <option key={idx} value={produto}>{produto}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col w-full md:w-1/2 p-2">
              <label className="font-semibold text-[#ffffff]">Quantidade:</label>
              <input
                className="border border-gray-300 focus:border-2 focus:border-[#1d3099] focus:outline-none bg-gray-700 p-2 text-white rounded"
                type="number"
                value={quantidade}
                onChange={handleQuantidadeChange}
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-[#127409] p-2 w-full md:w-1/2 rounded-full mt-4 text-white font-bold"
            >
              Adicionar Produto
            </button>
          </div>
        </form>

        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-bold text-white mb-2">Produtos do Pedido</h2>
          {listaProdutos.map((produto, index) => (
            <div key={index} className="flex justify-between items-center border-b border-gray-300 p-2">
              <span className="text-white">{produto.nome} (Qtd: {produto.quantidade})</span>
              <span className="text-white">R$ {(produto.preco * produto.quantidade).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <form>
          <div className="flex flex-col p-2">
            <label className="font-semibold text-[#ffffff]">Endereço:</label>
            <input
              className="border border-gray-300 focus:border-2 focus:border-[#1d3099] focus:outline-none bg-gray-700 p-2 text-white rounded"
              type="text"
              value={endereco}
              onChange={handleEnderecoChange}
            />
          </div>
          <div className="flex flex-col p-2">
            <label className="font-semibold text-[#ffffff]">Método de Pagamento:</label>
            <select
              className="border border-gray-300 focus:border-2 focus:border-[#1d3099] focus:outline-none bg-gray-700 p-2 text-white rounded"
              value={metodoPagamento}
              onChange={handleMetodoPagamentoChange}
            >
              <option value="Pix">Pix</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>
          </div>
          <div className="flex items-center p-2 mt-4">
            <label className="font-bold text-[#ffffff] mr-2">Pago</label>
            <input
              type="checkbox"
              checked={foiPago}
              onChange={handleFoiPagoChange}
              className="w-6 h-6"
            />
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleAdicionarPedido}
              className="bg-[#127409] p-2 w-full md:w-1/2 rounded-full mt-4 text-white font-bold"
            >
              Adicionar Pedido
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <h2 className="text-center font-semibold text-xl text-[#1d3099] mb-4 border-b border-gray-300">
          Lista de Pedidos
        </h2>
        {lista.slice().reverse().map((item, index) => (
          <div
            key={index}
            className="bg-gray-800 p-4 rounded-lg shadow-lg mb-4"
          >
            <h3 className="text-center font-bold text-lg text-white mb-2">Pedido número {lista.length - index}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-3 text-white font-bold mb-2">
                Produtos:
                <div className="font-normal">
                  {item.produtos.map(p => `${p.nome} (Qtd: ${p.quantidade})`).join(", ")}
                </div>
              </div>
              <div className="col-span-3 text-white font-bold mb-2">
                Endereço:
                <div className="font-normal">{item.endereco}</div>
              </div>
              <div className="col-span-3 text-white font-bold mb-2">
                Valor:
                <div className="font-normal">R$ {item.valor.toFixed(2)}</div>
              </div>
              <div className="col-span-3 text-white font-bold mb-2">
                Pagamento:
                <div className="font-normal">{item.metodoPagamento}</div>
              </div>
              <div className="col-span-3 text-white font-bold mb-2">
                Hora:
                <div className="font-normal">{item.hora}</div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                className="bg-green-500 p-2 rounded-full text-white flex items-center space-x-2"
                onClick={() => handleWhatsApp(index)}
              >
                <FaWhatsapp />
                <span>Enviar</span>
              </button>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <label className="font-bold text-white">Pago</label>
                  <input
                    type="checkbox"
                    checked={item.foiPago}
                    onChange={() => handleCheckboxChange(index)}
                    className="w-5 h-5"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <label className="font-bold text-white">Entregue</label>
                  <input
                    type="checkbox"
                    checked={item.foiEntregue}
                    onChange={() => handleEntregaChange(index)}
                    className="w-5 h-5"
                  />
                </div>
                <FaRegTrashAlt
                  className="text-red-500 cursor-pointer"
                  onClick={() => handleRemoverPedido(index)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <button
          onClick={generatePDF}
          className="bg-[#EA642D] p-2 w-full md:w-1/2 rounded-full mt-4 text-white font-bold"
        >
          Gerar Relatório do Dia
        </button>
      </div>
      <div className="flex justify-center">
        <button
          onClick={handleIniciarNovoDia}
          className="bg-red-500 p-2 w-full md:w-1/2 rounded-full mt-4 text-white font-bold"
        >
          Iniciar Novo Dia
        </button>
      </div>
    </div>
  );
};
