import React, { useCallback, useRef, useState } from 'react';
import dayjs from 'dayjs';
import './styles/App.css';

function MainComponent() {

    // Abrir dialog para adicionar item a lista
    const modal = useRef();
    const showModal = useCallback(() => {
        if (modal.current) {
            setTaskName('');
            setExpense('');
            setDate('');
            setEdit(null);
            modal.current.showModal();
        }
    }, []);
    const closeModal = useCallback(() => {
        if (modal.current) {
            modal.current.close();
        }
    }, []);
    // Abrir dialog para editar item da lista

    // Variáveis para criação de itens
    const [task, setTask] = useState([]);
    const [taskName, setTaskName] = useState('');
    const [expense, setExpense] = useState('');
    const [date, setDate] = useState('');
    // Variável para edição de item
    const [edit, setEdit] = useState(null);

    // Adicionar Task
    const addTask = useCallback(() => {
        if (taskName.trim() !== '' && expense.trim() !== '' && date.trim() !== '') {
            const  newItem = {
                name: taskName,
                cost: parseFloat(expense.replace(/\./g, "").replace(",", ".")),
                limitDate: dayjs(date).format('DD/MM/YYYY')
            };
            
            if (edit !== null) {
                // Editar task existente
                const updatedTasks = [...task];
                updatedTasks[edit] = newItem;
                setTask(updatedTasks);
            } else {
                // Adicionar nova task
                setTask([...task, newItem]);
            };
            
            
            setTaskName('');
            setExpense('');
            setDate('');
            setEdit(null);
            closeModal();
        };
    }, [taskName, expense, date, edit, closeModal, task]);

    // ----------------------------------------

    const editExistingTask = useCallback((index) => {
        const tarefa = task[index];
        setTaskName(tarefa.name);

        // Verifica se a tarefa.expense é um número
        const expense = typeof tarefa.cost === 'number' ? tarefa.cost : 0;
        const formattedExpense = expense.toLocaleString('pt-br', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        setExpense(formattedExpense);

        const [dia, mes, ano] = tarefa.limitDate.split('/');
        const formattedDate = dayjs(`${ano}-${mes}-${dia}`).format('YYYY-MM-DD');
        setDate(formattedDate);

        setEdit(index);
        modal.current.showModal();
    }, [task]);  

    // Formata o valor de custo para BRL
    const formatBRL = (valor) => {
        return new Intl.NumberFormat('pt-br', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const handleExpenseChange = (event) => {
        let value = event.target.value;
        value = value.replace(/\D/g, ""); // Remove caracteres não numéricos.
        value = (value / 100).toFixed(2).replace(".", ","); // Converte para números com centavos.

        // Adiciona pontos a cada 3 caracteres após a vírgula.
        value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

        setExpense(value);
    };

    // ----------------------------------------
    
    // Limita a quantia de caracteres no input de data limite
    const handleLimitDateChange = (event) => {
        let value = event.target.value;
        if (value.length <= 10) {
            setDate(value);
        };
    };

    // ----------------------------------------
    
    return (
        <main className="container">

            <div id="logo">
                <img className="logo-img" src={`${process.env.PUBLIC_URL}/assets/logo.svg`} alt="" />
                <h1>Little List</h1>
            </div>

            <section className="registers">

                <header className="tasks-header">
                    <span>Tarefa</span>
                    <span>Custo</span>
                    <span>Data Limite</span>
                </header>
                
                {/* Lista ordenada -> */}
                <ol>
                    {/* Exemplo de item na lista
                    <li>
                        <div className="task">
                            <strong>Desenvolver tal coisa</strong>
                        </div>

                        <span className="task-expense">
                            <small>R$</small>
                            400,00
                        </span>

                        <div className="date">
                            <span>08/11/2024</span>
                        </div>

                        <div className="buttons">
                            <img src={`${process.env.PUBLIC_URL}/assets/edit.svg`} className="edit-btn" alt="editar" />
                            <img src={`${process.env.PUBLIC_URL}/assets/remove.svg`} className="remove-btn" alt="remover" />
                        </div>
                    </li> */}

                    {/* Estrutura dos itens da lista -> */}
                    {task.map((tarefa, index) => (
                        <li key={index}>
                            <div className="task"><strong>{tarefa.name}</strong></div>

                            <span className="task-expense">{formatBRL(tarefa.cost)}</span>

                            <div className="date"><span>{tarefa.limitDate}</span></div>

                            <div className="buttons">
                            <img src={`${process.env.PUBLIC_URL}/assets/edit.svg`} 
                            className="edit-btn" alt="editar" 
                            onClick={() => editExistingTask(index)} />

                            <img src={`${process.env.PUBLIC_URL}/assets/remove.svg`} className="remove-btn" alt="remover" />
                            </div>
                        </li>
                    ))}
                </ol>

                {/* ------------------------------ */}

                {/* Botão de incluir item a lista de tarefas -> */}
                <button id="btn-include" onClick={showModal}>Incluir</button>
                <dialog id="add" ref={modal}>

                    <img src={`${process.env.PUBLIC_URL}/assets/remove.svg`} 
                    className="remove-btn" onClick={closeModal} alt="cancelar"/>

                    <input type="text" placeholder="Nome da Tarefa" className="add-task" 
                    value={taskName}
                    onChange={(event) =>
                        setTaskName(event.target.value)
                    }/>

                    <input type="text" placeholder="R$ 0,00" className="add-expense"
                    value={expense}
                    onChange={handleExpenseChange}/>

                    <input type="date" className="add-date" maxLength="10"
                    value={date}
                    onChange={handleLimitDateChange}/>

                    <button id="btn-add" onClick={addTask}>{edit !== null ? "Salvar" : "Adicionar"}</button>
                </dialog>

                {/* ------------------------------ */}
            </section>
        </main>
    );
}

export default MainComponent;