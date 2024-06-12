"use client";

import React, { useEffect, useState } from "react";
import { FaWhatsapp, FaRegTrashAlt } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Item {
  produto: string;
  quantidade: number;
  endereco: string;
  valor: number;
  metodoPagamento: string;
  foiPago: boolean;
  hora: string;
  foiEntregue: boolean;
}

const produtos = {
  Agua: 8.50,
  Gas: 110.0,
  CartelaDeOvos: 24.0,
};

export const FormComponent = () => {
  const [produto, setProduto] = useState("Agua");
  const [quantidade, setQuantidade] = useState(1);
  const [endereco, setEndereco] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("Pix");
  const [foiPago, setFoiPago] = useState(false);
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
    setProduto(e.target.value);
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

  const handleAdicionar = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    if (!produto || !quantidade || !endereco || produto === "" || endereco === "") {
      alert("Por favor, preencha todos os campos!");
      return;
    }
    const valor = quantidade * produtos[produto as keyof typeof produtos];
    const newItem: Item = {
      produto,
      quantidade,
      endereco,
      valor,
      metodoPagamento,
      foiPago,
      hora: getCurrentTime(),
      foiEntregue: false,
    };
    setLista([...lista, newItem]);

    setProduto("Agua");
    setQuantidade(1);
    setEndereco("");
    setMetodoPagamento("Pix");
    setFoiPago(false);
  };

  const handleRemover = (index: number) => {
    const updatedLista = lista.filter((_, idx) => idx !== index);
    setLista(updatedLista);
  };
  const handleWhatsApp = (index: number) => {
    const item = lista[index];
    const message = `*Novo pedido ${item.hora}*\n*Produto:* ${item.produto}\n*Quantidade:* ${item.quantidade}\n*Endereço/Cliente:* ${item.endereco}\n*Método de Pagamento:* ${item.metodoPagamento}\n*Valor: R$* ${item.valor} reais\n\nPor favor, confirme a entrega após a conclusão.`;
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
        head: [["Número do Pedido", "Produto", "Quantidade", "Endereço/Cliente", "Valor", "Pagamento", "Hora", "Pago", "Entregue"]],
        body: lista.map((item, index) => [
          lista.length - index,
          item.produto,
          item.quantidade,
          item.endereco,
          `R$ ${item.valor.toFixed(2)}`,
          item.metodoPagamento,
          item.hora,
          item.foiPago ? "Sim" : "Não",
          item.foiEntregue ? "Sim" : "Não",
        ]),
        startY: 40,
        styles: { halign: 'center' }, // Adicione esta linha
      });
    
      autoTable(doc, {
        body: [
          [`Total Caixa: R$ ${totalPagamento.toFixed(2)}`],
        ],
        startY: (doc as any).lastAutoTable.finalY + 10,
        styles: { halign: 'center' }, // Adicione esta linha
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
    // Calcula o índice correto
    const realIndex = lista.length - 1 - index;
  
    // Cria uma cópia da lista de pedidos
    const novaLista = [...lista];
    
    // Atualiza o status de pagamento do pedido específico
    novaLista[realIndex].foiPago = !novaLista[realIndex].foiPago;
    
    // Atualiza a lista de pedidos
    setLista(novaLista);
  };
  
  const handleEntregaChange = (index: number) => {
    // Calcula o índice correto
    const realIndex = lista.length - 1 - index;
  
    // Cria uma cópia da lista de pedidos
    const novaLista = [...lista];
    
    // Atualiza o status de entrega do pedido específico
    novaLista[realIndex].foiEntregue = !novaLista[realIndex].foiEntregue;
    
    // Atualiza a lista de pedidos
    setLista(novaLista);
  };

  return (
    <>
      <div>
        <form>
          <div className="flex flex-col px-2">
            <label className="font-semibold text-[#1d3099]">
              Produto:
            </label>
            <select
              className="border border-gray-300 focus:border-2 focus:border-[#1d3099] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded h-8"
              value={produto}
              onChange={handleProdutoChange}
            >
              <option value="Agua">Água</option>
              <option value="Gas">Gás</option>
              <option value="CartelaDeOvos">Cartela de Ovos</option>
            </select>
          </div>
          <div className="flex flex-col px-2">
            <label className="font-semibold text-[#1d3099]">
              Quantidade:
            </label>
            <input
              className="border border-gray-300 focus:border-2 focus:border-[#1d3099] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded h-8"
              type="number"
              value={quantidade}
              onChange={handleQuantidadeChange}
            />
          </div>
          <div className="flex flex-col px-2">
            <label className="font-semibold text-[#1d3099]">
              Endereço/Cliente:
            </label>
            <input
              className="border border-gray-300 focus:border-2 focus:border-[#1d3099] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded h-8"
              type="text"
              value={endereco}
              onChange={handleEnderecoChange}
            />
          </div>
          <div className="flex flex-col px-2">
            <label className="font-semibold text-[#1d3099]">
              Método de Pagamento:
            </label>
            <select
              className="border border-gray-300 focus:border-2 focus:border-[#1d3099] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded h-8"
              value={metodoPagamento}
              onChange={handleMetodoPagamentoChange}
            >
              <option value="Pix">Pix</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>
          </div>
          <div className="flex justify-between items-center px-2 gap-3">
            <div className="flex gap-2 mr-4 mt-5">
              <label className="font-bold text-[#1d3099]">Pago</label>
              <input
                type="checkbox"
                id="pagamento"
                checked={foiPago}
                onChange={handleFoiPagoChange}
                className="w-6 h-6"
              />
            </div>
          </div>
          <div className="flex justify-center">
            <button
              onClick={handleAdicionar}
              className="bg-[#127409] p-2 w-80 rounded-full mt-10 text-white font-bold">
              Adicionar
            </button>
          </div>
        </form>

        <div className="mt-8">
  <h2 className="flex justify-center font-semibold text-xl text-[#1d3099] border-b border-gray-300">
    Lista de Pedidos
  </h2>
  {lista.slice().reverse().map((item, index) => (
    <div
      key={index}
      className="grid grid-cols-3 font-semibold text-md gap-1 border-b border-gray-300 p-4 relative"
    >
      <h3 className="col-span-3 font-bold text-center text-[#ffffff] bg-slate-500 mb-2">Pedido número {lista.length - index}</h3>
      <hr className="col-span-3 border-gray-300"/>
      <p className="flex flex-col font-bold">
        Produto:
        <span className="font-semibold"> {item.produto}</span>
      </p>
      <p className="flex flex-col font-bold">
        Quantidade:
        <span className="font-semibold"> {item.quantidade}</span>
      </p>
      <p className="flex flex-col font-bold">
        Endereço:
        <span className="font-semibold"> {item.endereco}</span>
      </p>
      <p className="flex flex-col font-bold">
        Valor:
        <span className="font-semibold"> R$ {item.valor}</span>
      </p>
      <p className="flex flex-col font-bold">
        Pagamento:
        <span className="font-semibold"> {item.metodoPagamento}</span>
      </p>
      <p className="flex flex-col font-bold">
        Hora:
        <span className="font-semibold"> {item.hora}</span>
      </p>
      <hr className="col-span-3 border-gray-300 p-4"/>
      <div className="absolute bottom-1 left-2 flex items-center space-x-4">
        <button
          className="bg-green-500 p-2 rounded-full text-white flex items-center space-x-2"
          onClick={() => handleWhatsApp(index)}
        >
          <FaWhatsapp />
          <span>Enviar</span>
        </button>
      </div>
      <div className="absolute bottom-3 right-2 flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="font-bold">Pago</label>
          <input
            type="checkbox"
            checked={item.foiPago}
            onChange={() => handleCheckboxChange(index)}
            className="w-5 h-5"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="font-bold">Entregue</label>
          <input
            type="checkbox"
            checked={item.foiEntregue}
            onChange={() => handleEntregaChange(index)}
            className="w-5 h-5"
          />
        </div>
        <div className="ml-4">
          <FaRegTrashAlt
            className="text-red-500 cursor-pointer"
            onClick={() => handleRemover(index)}
          />
        </div>
      </div>
    </div>
  ))}
</div>
<div className="flex justify-center">
  <button
    onClick={generatePDF}
    className="bg-[#EA642D] p-2 w-80 rounded-full mt-10 text-white font-bold"
  >
    Gerar Relatorio do Dia
  </button>
</div>
<div className="flex justify-center">
  <button
    onClick={handleIniciarNovoDia}
    className="bg-red-500 p-2 w-80 rounded-full mt-10 text-white font-bold"
  >
    Iniciar Novo Dia
  </button>
</div>
</div>
</>
);
};