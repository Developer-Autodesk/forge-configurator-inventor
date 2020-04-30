import React, { Component } from 'react';
import { connect } from 'react-redux';
import './parametersContainer.css'
import Parameter from './parameter';
import { getActiveProject } from '../reducers/mainReducer';
import { fetchParameters } from '../actions/parametersActions'
import Button from '@hig/button';

export class ParametersContainer extends Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.props.fetchParameters(this.props.activeProject.id);
    }

    render() {
        const parameterList = this.props.activeProject.parameters;

        if (!parameterList) {
            return (<span>No parameters</span>)
        } else {
            return (
                <div className="parametersContainer">
                    <div className="parameters">
                    {
                        parameterList.map((parameter, index) => (<Parameter key={index} parameter={parameter}/>))
                    }
                    </div>
                    <div className="buttonsContainer">
                        <hr/>                            
                        <div className="buttons">
                            <Button
                                size="standard"
                                title="Cancel"
                                type="primary"
                            />
                            <Button
                                size="standard"
                                title="Update"
                                type="primary"
                            />
                        </div>
                    </div>
                </div>
            )
        }
    }
}

export default connect(function (store) {
    return {
        activeProject: getActiveProject(store)
    }
}, { fetchParameters })(ParametersContainer);
