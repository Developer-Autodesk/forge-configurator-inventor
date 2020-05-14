import React, { Component } from 'react';
import { connect } from 'react-redux';
import './parametersContainer.css';
import Parameter from './parameter';
import { getActiveProject, getParameters, getUpdateParameters, updateProgressShowing } from '../reducers/mainReducer';
import { fetchParameters, resetParameters, updateModelWithParameters } from '../actions/parametersActions';
import Button from '@hig/button';
import Modal from '@hig/modal';

export class ParametersContainer extends Component {

    componentDidMount() {
        this.props.fetchParameters(this.props.activeProject.id);
    }

    updateClicked() {
        alert("Update of model on server is not implemented yet. Parameter values will be returned back for now.");
        this.props.resetParameters(this.props.activeProject.id);

        const data = {
            parameters: this.props.activeProject.updateParameters,
            // for testing ONLY now
            sleep: 5000
        };
        this.props.updateModelWithParameters(this.props.activeProject.id, data);
    }

    render() {
        const parameterList = this.props.activeProject ? this.props.projectUpdateParameters : [];
        const buttonsContainerClass = parameterList ? "buttonsContainer" : "buttonsContainer hidden";

        return (
            <div className="parametersContainer">
                <div className="parameters">
                {
                    parameterList ?
                        parameterList.map((parameter, index) => (<Parameter key={index} parameter={parameter}/>))
                        : "No parameters"
                }
                </div>
                <div className={buttonsContainerClass}>
                    <hr/>
                    <div className="buttons">
                        <Button
                            size="standard"
                            title="Cancel"
                            type="primary"
                            onClick={() => {this.props.resetParameters(this.props.activeProject.id, this.props.projectSourceParameters);}}
                        />
                        <Button
                            size="standard"
                            title="Update"
                            type="primary"
                            onClick={() => {this.updateClicked();}}
                        />
                        <Modal open={this.props.updateProgressShowing} title="Wait please" id="Modal" name="Modal" onCloseClick={() => this.closeModal()}>Model is now being updated based on the changed parameters.</Modal>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(function (store) {
    const activeProject = getActiveProject(store);

    return {
        activeProject: activeProject,
        projectSourceParameters: getParameters(activeProject.id, store),
        projectUpdateParameters: getUpdateParameters(activeProject.id, store),
        updateProgressShowing: updateProgressShowing(store)
    };
}, { fetchParameters, resetParameters, updateModelWithParameters })(ParametersContainer);
