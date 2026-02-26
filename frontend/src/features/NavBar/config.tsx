import type { NavigationItem } from "./types";
import QuestionBuilder from "../QuestionBuilder/page";
import AllQuestions from "../QuestionTable/page";
import { QuestionWorkspace } from "../QuestionWorkspace";
import { CreateQuestion } from "../CreateQuestion";

export const Navigation: NavigationItem[] = [
    // {
    //     type: "route",
    //     displayName: "Home",
    //     path: "/",
    //     element: <Home />,
    //     includeNavBar: true,
    //     requiresAuth: false,
    //     allowedRoles: [],
    // },
    // {
    //     type: "route",
    //     displayName: "Home",
    //     path: "/home",
    //     element: <Home />,
    //     includeNavBar: false,
    //     requiresAuth: false,
    //     allowedRoles: [],
    // },
    {
        type: "route",
        includeNavBar: true,
        requiresAuth: false,
        allowedRoles: [],
        displayName: "QuestionBuilder",
        path: "/question_builder",
        element: <QuestionBuilder />,
        items: [
            {
                displayName: "AllQuestions",
                element: <AllQuestions />,
                path: "/question_builder/all",
            },
            {
                displayName: "CurrentQuestion",
                element: <QuestionWorkspace />,
                path: "/question_builder/current",
            },
            {
                displayName: "Create Question",
                element: <CreateQuestion />,
                path: "/question_builder/create",
            },
        ],
    },
];
