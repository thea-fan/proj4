import React from 'react';
import PropTypes from 'prop-types';

//-----------------IMPORT COMPONENTS---------------------
import EditTodoItem from '../editTodoItem/editTodoItem';

//------------------------COMPONENT-----------------------------

class TodoItem extends React.Component {
    render() {
        let index=this.props.index;
        let item=this.props.item;
        let checkboxClass = <input type="checkbox" onChange={() => {this.props.checkItem(index)}} />;
        if (item.checked) {
            checkboxClass = <input type="checkbox" onChange={() => {this.props.checkItem(index)}} checked/>;
        }

        let itemDisplay = <span>{checkboxClass} {item.text}</span>;

        if (item.editing) {
            itemDisplay = (
                <EditTodoItem
                    index={index}
                    todoItem={this.props.item.text}
                    updateItem={this.props.updateItem}>
                </EditTodoItem>
            );
        }

        return (
            <div>
                <p>
                {itemDisplay} <br/> <small>Posted on {item.created_at}</small>
                <button onClick={() => {this.props.editItem(index)}}>Edit</button>
                <button onClick={() => {this.props.removeItem(index)}}>Delete</button>
                </p>
            </div>
        )
    }
}


export default TodoItem;

TodoItem.propTypes = {
  index: PropTypes.number,
  item: PropTypes.object,
  todoItem: PropTypes.string,
  updateItem: PropTypes.func,
  checkItem: PropTypes.func,
  editItem: PropTypes.func,
  removeItem: PropTypes.func
};