import {
    AsyncStorage,
} from "react-native";

var EventEmitter = require("events").EventEmitter;
var _ = require("lodash");

import ActionTypes from "~/constants/ActionTypes.js";
import FlickerstripDispatcher from "~/dispatcher/FlickerstripDispatcher.js";

class TaskManager extends EventEmitter {
    constructor(props) {
        super(props);

        FlickerstripDispatcher.register(function(e) {
        }.bind(this));

        this.taskList = {};
    }
    createTaskId() {
        var id = null;
        while(!id || this.taskList[id] !== undefined) {
            id = Math.ceil(Math.random()*100000);
        }
        return id;
    }
    //opt.name
    //opt.text
    //opt.currentStep
    //opt.totalSteps
    //opt.progress
    start(priority, category, opt) {
        var id = this.createTaskId();

        opt.priority = priority;
        opt.category = category;
        if (opt.totalSteps) opt.currentStep = 0;

        this.taskList[id] = opt;
        this.emit("StatusUpdated");
        return id;
    }
    updateProgress(id,step,progress,autocomplete) {
        var task = this.taskList[id];
        if (step === true) step = task.currentStep+1;

        if (autocomplete && step >= task.totalSteps) {
            this.complete(id);
            return true;
        }

        task.currentStep = step;
        if (progress) {
            task.progress = progress;
        } else {
            task.progress = Math.floor(100.0 * task.currentStep / task.totalSteps);
        }

        this.emit("StatusUpdated");
    }
    complete(id) {
        var task = this.taskList[id];
        delete this.taskList[id];
        this.emit("StatusUpdated");
    }
    getActiveTask() {
        var activeTask = null;
        _.each(this.taskList,function(value,key) {
            if (activeTask == null || value.priority < activeTask.priority) activeTask = value;
        });

        return activeTask;
    }
}

var taskManager = new TaskManager();
export default taskManager;

