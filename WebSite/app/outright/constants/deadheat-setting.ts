export const DeadHeatSettings = {
    UnSet: null,
    No: 0,
    Yes: 1
} 

export const DeadHeatOptions: DeadHeatOption[] = [
    {
        name: "Not Set",
        description: "Can only calculate 1 team as \"Won\".",
        value: null
    },
    {
        name: "No",
        description: "Can calculate 1 or multiple team as \"Won\" ＆ Dead Heat not applied.",
        value: false
    },
    {
        name: "Yes",
        description: "Can calculate 1 or multiple team as \"Won\" ＆ Dead Heat applied.",
        value: true
    
    }

]

type DeadHeatOption = {
    name: string;
    description: string;
    value: boolean | null
}