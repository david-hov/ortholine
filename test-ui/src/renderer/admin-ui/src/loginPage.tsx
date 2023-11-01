import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import { useLogin, useNotify } from 'react-admin';
import { useEffect, useState } from 'react';
import { FormControl, IconButton, InputAdornment, InputLabel, OutlinedInput } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

import Logo from '../../../../assets/images/back.png'

export const LoginPage = () => {
    const login = useLogin();
    const notify = useNotify();
    const [formInput, setFormInput] = useState('');
    const [settings, opentSettings] = useState(false);
    const [clickCount, setClickCount] = useState(0);
    const [showPassword, setShowPassword] = React.useState(false);

    useEffect(() => {
        const apiUrl = localStorage.getItem('engine-ip');
        if (apiUrl) {
            const urlObject = new URL(apiUrl);
            const ipAddress = urlObject.hostname;
            setFormInput(ipAddress)
        }
    }, [])

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        login({
            username: data.get('username'),
            password: data.get('password'),
        }).catch(() => notify('Սխալ օգտանուն կամ գաղտնաբառ'));
    };

    const handleSubmitSettings = (evt: any) => {
        evt.preventDefault();
        localStorage.setItem('engine-ip', `http://${formInput}:3001`);
        localStorage.setItem('engine-socket-ip', `http://${formInput}:4001`);
        window.location.reload()
    };

    return (
        <Container style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column'
        }} component="main" maxWidth="xs">
            <CssBaseline />
            <div
                style={{
                    padding: '0 25px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column'
                }}
            >
                <div>
                    <img style={{ width: '100px', height: '100px', objectFit: 'contain' }} onClick={() => {
                        setClickCount(clickCount + 1);
                        if (clickCount == 1) {
                            setClickCount(0);
                            opentSettings(!settings);
                        }
                    }} src={Logo} />
                </div>
                {settings ?
                    <form style={{
                        display: 'flex',
                        flexDirection: 'column',
                    }} onSubmit={handleSubmitSettings}>
                        <TextField
                            label="IP"
                            id="margin-normal"
                            name="name"
                            value={formInput}
                            helperText="Սերվեռ IP"
                            onChange={(e: any) => setFormInput(e.target.value)}
                        />
                        <Button type='submit'>Պահպանել</Button>
                    </form>
                    :
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel htmlFor="outlined-adornment-login">Օգտանուն</InputLabel>
                            <OutlinedInput
                                name='username'
                                id="outlined-adornment-login"
                                type='text'
                                label="Օգտանուն"
                            />
                        </FormControl>
                        <FormControl fullWidth variant="outlined">
                            <InputLabel htmlFor="outlined-adornment-password">Գաղտնաբառ</InputLabel>
                            <OutlinedInput
                                name='password'
                                id="outlined-adornment-password"
                                type={showPassword ? 'text' : 'password'}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                                label="Գաղտնաբառ"
                            />
                        </FormControl>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Մուտք
                        </Button>
                    </Box>
                }
            </div>
        </Container>
    );
}