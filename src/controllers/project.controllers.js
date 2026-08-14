import { User } from "../models/user.models.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { ApiResponse } from "../utils/api_response.js";
import { asynchandler } from "../utils/async_handler.js";
import { ApiError } from "../utils/api_error.js";
import {
  emailverificationmailgencontent,
  fogotpassowordmailgencontent,
  sendemail,
} from "../utils/mail.js";

const getProjects = asynchandler(async (req, res) => {
    
});

const getProjectById = asynchandler(async (req, res) => {

});
const createProject = asynchandler(async (req, res) => {

});

const updateProject = asynchandler(async (req, res) => {

});

const deleteProject = asynchandler(async (req, res) => {
    
});

const addMembersToProject = asynchandler(async (req, res) => {
    

});
const getProjectMembers = asynchandler(async (req, res) => {

});

const updateMemberRole = asynchandler(async (req, res) => {

});

const deleteMember = asynchandler(async (req, res) => {

});

export {
    addMembersToProject,
    createProject,
    deleteMember,
    deleteProject,
    getProjectById,
    getProjectMembers,
    getProjects,
    updateMemberRole,
    updateProject
}