import './App.css';
import logo from './assets/logo.png'
import {
  Container, Nav, NavItem, NavLink, Row, Col
} from 'reactstrap';
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import QRRapido from './QRRapido';
import CargaDeExcel from './CargaDeExcel';

function App() {

  const [actTabQR, setActTabQR] = useState('active');
  const [actTabCargaExcel, setActTabCargaExcel] = useState('');

  const clicTabQR = () => {
    setActTabQR('active');
    setActTabCargaExcel('');
  }
  const clicTabCargaExcel = () => {
    setActTabCargaExcel('active');
    setActTabQR('');
  }

  return (
    <div className="App">
      <Container>
        <Row>
          <Col xs="12">
            <p style={{ textAlign: "left" }}><img src={logo} width={'20%'} height={'20%'} /></p>
          </Col>
        </Row>
        <Row>
          <Col xs="12">
            <Nav tabs>
              <NavItem>
                <NavLink
                  active={actTabQR}
                  onClick={() => clicTabQR()}
                >
                  QR rapido
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink
                  active={actTabCargaExcel}
                  onClick={() => clicTabCargaExcel()}
                >
                  Carga desde Excel
                </NavLink>
              </NavItem>
            </Nav>
          </Col>
        </Row>
        {actTabQR === 'active' &&
          <QRRapido />
        }
        {actTabCargaExcel === 'active' &&
          <CargaDeExcel />
        }
      </Container>
    </div>
  );
}

export default App;
