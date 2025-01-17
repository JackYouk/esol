"use client"
import React, { createContext, useContext, useState, type ReactNode } from 'react';

type SelectedTextContextType = {
    value: string;
    setValue: (value: string) => void;
};

const SelectedTextContext = createContext<SelectedTextContextType>({
    value: '',
    setValue: () => { }
});

export const useSelectedText = () => {
    const context = useContext(SelectedTextContext);
    if (!context) {
        throw new Error('useSelectedText must be used within a SelectedTextProvider');
    }
    return context;
};

type SelectedTextProviderProps = {
    children: ReactNode;
    initialValue?: string;
};

export const SelectedTextProvider = ({
    children,
    initialValue = ''
}: SelectedTextProviderProps) => {
    const [value, setValue] = useState(initialValue);

    return (
        <SelectedTextContext.Provider value={{ value, setValue }}>
            {children}
        </SelectedTextContext.Provider>
    );
};