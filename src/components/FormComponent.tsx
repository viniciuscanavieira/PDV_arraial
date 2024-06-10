"use client";

import React, { useEffect, useState } from "react";
import { FaRegTrashAlt } from "react-icons/fa";
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
}

const produtos = {
  Agua: 8.5,
  Gas: 110,
  CartelaDeOvos: 24,
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
    };
    setLista([...lista, newItem]);

    setProduto("Agua");
    setQuantidade(1);
    setEndereco("");
    setMetodoPagamento("Pix");
    setFoiPago(false);
  };

  const handleCheckboxChange = (index: number) => {
    const updatedLista = lista.map((item, idx) => {
      if (idx === index) {
        return { ...item, foiPago: !item.foiPago };
      }
      return item;
    });
    setLista(updatedLista);
  };

  const handleRemover = (index: number) => {
    const updatedLista = lista.filter((_, idx) => idx !== index);
    setLista(updatedLista);
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
      head: [["Produto", "Quantidade", "Endereço/Cliente", "Valor", "Método de Pagamento", "Hora", "Pago"]],
      body: lista.map((item) => [
        item.produto,
        item.quantidade,
        item.endereco,
        `R$ ${item.valor.toFixed(2)}`,
        item.metodoPagamento,
        item.hora,
        item.foiPago ? "Sim" : "Não",
      ]),
      startY: 40,
    });

    autoTable(doc, {
      body: [
        [`Total Caixa: R$ ${totalPagamento.toFixed(2)}`],
      ],
      startY: (doc as any).lastAutoTable.finalY + 10,
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

  return (
    <>
      <div>
        <form>
          <div className="flex flex-col px-2">
            <label className="font-semibold text-[#EA642D]">
              Produto:
            </label>
            <select
              className="border border-gray-300 focus:border-2 focus:border-[#EA642D] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded h-8"
              value={produto}
              onChange={handleProdutoChange}
            >
              <option value="Agua">Água</option>
              <option value="Gas">Gás</option>
              <option value="CartelaDeOvos">Cartela de Ovos</option>
            </select>
          </div>
          <div className="flex flex-col px-2">
            <label className="font-semibold text-[#EA642D]">
              Quantidade:
            </label>
            <input
              className="border border-gray-300 focus:border-2 focus:border-[#EA642D] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded h-8"
              type="number"
              value={quantidade}
              onChange={handleQuantidadeChange}
            />
          </div>
          <div className="flex flex-col px-2">
            <label className="font-semibold text-[#EA642D]">
              Endereço/Cliente:
            </label>
            <input
              className="border border-gray-300 focus:border-2 focus:border-[#EA642D] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded h-8"
              type="text"
              value={endereco}
              onChange={handleEnderecoChange}
            />
          </div>
          <div className="flex flex-col px-2">
            <label className="font-semibold text-[#EA642D]">
              Método de Pagamento:
            </label>
            <select
              className="border border-gray-300 focus:border-2 focus:border-[#EA642D] focus:outline-none bg-[#403C3D] p-2 text-zinc-100 text-bold rounded h-8"
              value={metodoPagamento}
              onChange={handleMetodoPagamentoChange}
            >
              <option value="Pix">Pix</option>
              <option value="Dinheiro">Dinheiro</option>
            </select>
          </div>
          <div className="flex justify-between items-center px-2 gap-3">
            <div className="flex gap-2 mr-4 mt-5">
              <label className="font-bold text-[#EA642D]">Pago</label>
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
              className="bg-[#EA642D] p-2 w-80 rounded-full mt-10 text-white font-bold"
            >
              Adicionar
            </button>
          </div>
        </form>

        <div className="mt-8">
          <h2 className="flex justify-center font-semibold text-xl text-[#EA642D] border-b border-gray-300">
            Lista de Pedidos
          </h2>
          {lista.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-3 font-semibold text-md gap-2 border-b border-gray-300 p-4 relative"
            >
              <p className="flex flex-col font-bold">
                Produto:
                <span className="font-semibold"> {item.produto}</span>
              </p>
              <p className="flex flex-col font-bold">
                Quantidade:
                <span className="font-semibold"> {item.quantidade}</span>
              </p>
              <p className="flex flex-col font-bold">
                Endereço/Cliente:
                <span className="font-semibold"> {item.endereco}</span>
              </p>
              <p className="flex flex-col font-bold">
                Valor:
                <span className="font-semibold"> R$ {item.valor}</span>
              </p>
              <p className="flex flex-col font-bold">
                Método de Pagamento:
                <span className="font-semibold"> {item.metodoPagamento}</span>
              </p>
              <p className="flex flex-col font-bold">
                Hora:
                <span className="font-semibold"> {item.hora}</span>
              </p>
              <div className="absolute bottom-2 right-2 flex items-center">
                <label className="font-bold mr-2">Pago</label>
                <input
                  type="checkbox"
                  checked={item.foiPago}
                  onChange={() => handleCheckboxChange(index)}
                  className="w-5 h-5 mr-2"
                />
                <FaRegTrashAlt
                  className="text-red-500 cursor-pointer"
                  onClick={() => handleRemover(index)}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <button
            onClick={generatePDF}
            className="bg-[#EA642D] p-2 w-80 rounded-full mt-10 text-white font-bold"
          >
            Gerar PDF
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
