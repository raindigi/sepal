import {Button} from 'widget/button'
import {ButtonGroup} from 'widget/buttonGroup'
import {Form, form} from 'widget/form/form'
import {Layout} from 'widget/layout'
import {compose} from 'compose'
import {invalidCredentials, login, resetInvalidCredentials} from 'widget/user'
import {msg} from 'translate'
import PropTypes from 'prop-types'
import React from 'react'
import styles from './login.module.css'

const fields = {
    username: new Form.Field()
        .notBlank('landing.login.username.required'),
    password: new Form.Field()
        .notBlank('landing.login.password.required')
}

const signUp = () =>
    window.location = 'https://docs.google.com/forms/d/e/1FAIpQLSci4hopXNtMOQKJzsUybaJETrAPQp8j6TCqycSBQ0XO37jBwA/viewform?c=0&w=1'

const mapStateToProps = () => ({
    errors: invalidCredentials() ? {password: msg('landing.login.password.invalid')} : {}
})

class Login extends React.Component {
    login({username, password}) {
        login({username, password})
        // this.props.stream('LOGIN', login$(username, password))
    }

    componentWillUnmount() {
        resetInvalidCredentials()
    }

    forgotPassword() {
        const {onForgotPassword} = this.props
        onForgotPassword()
    }

    render() {
        const {form, inputs: {username, password}, action} = this.props
        return (
            <Form className={styles.form} onSubmit={() => this.login(form.values())}>
                <Layout spacing='loose'>
                    <Form.Input
                        label={msg('landing.login.username.label')}
                        input={username}
                        placeholder={msg('landing.login.username.placeholder')}
                        autoFocus
                        tabIndex={1}
                        errorMessage
                    />
                    <Form.Input
                        label={msg('landing.login.password.label')}
                        input={password}
                        type='password'
                        placeholder={msg('landing.login.password.placeholder')}
                        tabIndex={2}
                        errorMessage
                    />
                    <ButtonGroup layout='horizontal-wrap' alignment='fill'>
                        <ButtonGroup layout='horizontal-nowrap' spacing='tight'>
                            <Button
                                chromeless
                                look='transparent'
                                size='large'
                                shape='pill'
                                alignment='left'
                                label={msg('landing.login.sign-up')}
                                tabIndex={4}
                                onMouseDown={e => e.preventDefault()}
                                onClick={signUp}
                            />
                            <Button
                                chromeless
                                look='transparent'
                                size='large'
                                shape='pill'
                                alignment='left'
                                label={msg('landing.login.forgot-password-link')}
                                tabIndex={5}
                                onMouseDown={e => e.preventDefault()}
                                onClick={() => this.forgotPassword()}
                            />
                        </ButtonGroup>
                        <ButtonGroup layout='horizontal-nowrap' alignment='fill'>
                            <Button
                                type='submit'
                                look='apply'
                                size='x-large'
                                shape='pill'
                                additionalClassName={styles.loginButton}
                                icon={action('LOGIN').dispatching ? 'spinner' : 'sign-in-alt'}
                                label={msg('landing.login.button')}
                                disabled={form.isInvalid() || action('LOGIN').dispatching}
                                tabIndex={3}
                            />
                        </ButtonGroup>
                    </ButtonGroup>
                </Layout>
            </Form>
        )
    }
}

Login.propTypes = {
    onForgotPassword: PropTypes.func.isRequired,
    form: PropTypes.object,
    inputs: PropTypes.object
}

export default compose(
    Login,
    form({fields, mapStateToProps})
)
