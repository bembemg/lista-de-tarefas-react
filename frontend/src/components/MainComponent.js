import React, { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { ReactSortable } from "react-sortablejs";
import '../styles/App.css';

const API_URL = 'http://localhost:3333';

function MainComponent() {

    useEffect(() => {
        fetchTasks();
    }, []);
    
    const fetchTasks = async () => {
        try {
            const response = await fetch(`${API_URL}/tasks`);
            const data = await response.json();
            setTask(data);
        } catch (error) {
            console.error("Erro ao buscar tarefas!", error);
        }
    }

    // Variáveis para criação de itens
    const [task, setTask] = useState([]);
    const [taskName, setTaskName] = useState('');
    const [expense, setExpense] = useState('');
    const [date, setDate] = useState('');
    // Variável para edição de item
    const [edit, setEdit] = useState(null);
    // Variável para exclusão de item
    const [itemToDelete, setItemToDelete] = useState(null);
    // Variável para mensagem de erro
    const [errorMessage, setErrorMessage] = useState('');

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
    
    const remove = useRef();
    const closeRemoveModal = useCallback(() => {
        if (remove.current) {
            setItemToDelete(null);
            remove.current.close();
        };
    }, []);
        
    // Adicionar Task
    const addTask = async () => {
        if (taskName.trim() !== '' && expense.trim() !== '' && date.trim() !== '') {
            // Verifica se já existe uma tarefa com o mesmo nome
            const tarefaExistente = task.some((item, index) => 
                // Ignora o item atual sendo editado
                index !== edit && item.name.toLowerCase() === taskName.trim().toLowerCase()
            );
    
            if (tarefaExistente) {
                setErrorMessage('Já existe uma tarefa com este nome!');
                setTimeout(() => {
                    setErrorMessage('');
                }, 5000);
                return;
            }
    
            const newItem = {
                name: taskName,
                cost: parseFloat(expense.replace(/\./g, "").replace(",", ".")),
                limit_date: dayjs(date).format('DD/MM/YYYY')
            };

            try {
                if (edit !== null) {
                    await fetch(`${API_URL}/tasks/${task[edit].id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newItem)
                    });
                } else {
                    await fetch(`${API_URL}/tasks`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newItem)
                    });
                }

                fetchTasks();
                closeModal();
                setTaskName('');
                setExpense('');
                setDate('');
                setEdit(null);
            } catch (error) {
                console.error("Erro ao salvar tarefa!", error);
            }
            
            // if (edit !== null) {
            //     const updatedTasks = [...task];
            //     updatedTasks[edit] = newItem;
            //     setTask(updatedTasks);
            // } else {
            //     setTask([...task, newItem]);
            // }
            
        //     setTaskName('');
        //     setExpense('');
        //     setDate('');
        //     setEdit(null);
        //     closeModal();
        // } else {
        //     setErrorMessage('Preencha todos os campos antes de adicionar.');
        //     setTimeout(() => {
        //         setErrorMessage('');
        //     }, 5000);
        }
    };
    
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

        const [dia, mes, ano] = tarefa.limit_date.split('/');
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

    // Confirma se o usuário deseja excluir o item
    const deleteTask = async () => {
        if (itemToDelete !== null) {
            try {
                await fetch(`${API_URL}/tasks/${task[itemToDelete].id}`, {
                    method: 'DELETE'
                });
                fetchTasks();
                closeRemoveModal();
            } catch (error) {
                console.error("Erro ao deletar tarefa!", error);
            }
        }
    };
    // const deleteTask = useCallback((index) => {
    //     if (remove.current && itemToDelete !== null) {
    //         const updatedTasks = [...task];
    //         updatedTasks.splice(itemToDelete, 1);
    //         setTask(updatedTasks);
    //         closeRemoveModal();
    //     };
    // }, [closeRemoveModal, task, itemToDelete]);

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

        <ReactSortable 
            tag="ol"
            list={task}
            setList={setTask}
            animation={200}
            handle=".handle"
            delay={150}
            delayOnTouchOnly={true}
            touchStartThreshold={5}
        >

        {task.map((tarefa, index) => (
            <li key={index} className={tarefa.cost >= 1000 ? "expensive-task" : ""}>
                <div className="task"><strong>{tarefa.name}</strong></div>

                <span className="task-expense">{formatBRL(tarefa.cost)}</span>

                <div className="date"><span>{tarefa.limit_date}</span></div>

                <div className="buttons">
                    <img src={`${process.env.PUBLIC_URL}/assets/edit.svg`} 
                        className="edit-btn" 
                        alt="editar" 
                        onClick={() => editExistingTask(index)} />
                    <img src={`${process.env.PUBLIC_URL}/assets/remove.svg`} 
                        className="remove-btn" 
                        alt="remover"
                        onClick={() => {
                            setItemToDelete(index);
                            remove.current?.showModal();
                        }} 
                    />
                </div>

                <div className='handle'>☰</div>
            </li>
        ))}
        </ReactSortable>

            {/* ------------------------------ */}

            {/* Botão de incluir item a lista de tarefas -> */}
            <button id="btn-include" onClick={showModal}>Incluir</button>

            {/* dialog para adicionar novo item a lista -> */}
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

                {errorMessage && (
                    <div className="error-message">
                        {errorMessage}
                    </div>
                )}

                <button id="btn-add" onClick={addTask}>{edit !== null ? "Salvar" : "Adicionar"}</button>
            </dialog>

            {/* ------------------------------ */}

            {/* dialog de confirmação de exclusão de item */}
            <dialog id="remove" ref={remove}>
                <p>Tem certeza que deseja excluir este item?</p>
                <img src={`${process.env.PUBLIC_URL}/assets/confirm.svg`} alt="confirmar"
                    onClick={deleteTask}/>
                <img src={`${process.env.PUBLIC_URL}/assets/remove.svg`} alt="cancelar" 
                    onClick={closeRemoveModal}/>
            </dialog>
            </section>
    </main>
    );
};

export default MainComponent;