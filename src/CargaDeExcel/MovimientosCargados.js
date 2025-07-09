import '../App.css';
import loader from '../assets/loader.gif';
import {
    Form, FormGroup, Input, Row, Col, Modal, ModalFooter, Label,
    Container, Alert, Button, Table, ModalBody, ModalHeader, FormFeedback
} from 'reactstrap';
import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import { BakeryColor, BakeryFont } from '@barcode-bakery/barcode-react';
import { BakeryDatamatrix } from '@barcode-bakery/barcode-react/datamatrix';

class MovimientosCargados extends Component {

    hostapi = "http://localhost:5265";
    colorBlack = new BakeryColor(0, 0, 0);
    colorWhite = new BakeryColor(255, 255, 255);
    constructor(props) {
        super(props)
        this.state = {
            modalProcesando: false,
            movimientos: [],
            modalQR: false,
            qrValue: ""
        }
    }

    toggleProcesando = () => {
        this.setState({ modalProcesando: !this.state.modalProcesando });
    }

    getMovimientos = async (id) => {
        this.toggleProcesando()
        await axios.get(`${this.hostapi}/api/MovimientosOdT1/${id}`)
            .then(res => {
                console.log(res.data)
                this.setState({
                    movimientos: res.data.movimientos,
                    modalProcesando: false
                })
            })
            .catch(err => {
                this.setState({ modalProcesando: false })
                alert(`Error:\n${err}`)
            })
    }

    componentDidMount() {
        this.getMovimientos(this.props.idOdT)
    }

    toggleQR = () => this.setState({modalQR: !this.state.modalQR});

    qrView = (movto) => {
        console.log(`P${this.props.partNumber},Q${movto.quantity},K${this.props.poNumber},N${movto.serialNumber}`)
        this.setState({ 
            qrValue: `P${this.props.partNumber},Q${movto.quantity},K${this.props.poNumber},N${movto.serialNumber}`
        });
        this.toggleQR();
    }

    imprimirEtiqueta = (movto) => {
        this.toggleProcesando()
        var etiqueta = {
            descripcion: this.props.descripcion,
            partNumber: this.props.partNumber,
            quantity: movto.quantity,
            poNumber: this.props.poNumber,
            trace: "",
            serialNumber: movto.serialNumber
        }
        var request = new Request(
          `${this.hostapi}/api/DocumentoPDF/GeneraEtiqueta`,
          {
            method: "post",
            body: JSON.stringify(etiqueta),
            headers: {
              'Content-Type': 'application/json'
            },
            mode: "cors",
            cache: "default",
          }
        );
        fetch(request)
          .then((response) => response.blob())
          .then((blob) => {
            const file = window.URL.createObjectURL(blob);
            this.setState({modalProcesando: false})
            window.open(file);
          })
          .catch((err) => {
            alert(`Error:\n${err}`);
          })
      }

    render() {
        return (
            <Container>
                <Row>
                    <Col xs="12">
                        <Table>
                            <thead>
                                <tr>
                                    <th>Part Number (P)</th>
                                    <th>Quantity (Q)</th>
                                    <th>Serial Number (N)</th>
                                    <th>Fecha y hora</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.movimientos.map(movto => {
                                    return (
                                        <tr key={movto.idMovto}>
                                            <td>{this.props.partNumber}</td>
                                            <td>{movto.quantity}</td>
                                            <td>{movto.serialNumber}</td>
                                            <td>{movto.timestamp}</td>
                                            <td>
                                                <Button color="secondary" type="button" onClick={() => this.qrView(movto)}>
                                                    <span className="fa-solid fa-qrcode"></span>
                                                </Button>
                                                <Button color="primary" type="button" onClick={() => this.imprimirEtiqueta(movto)}>
                                                    <span className="fa-solid fa-print"></span>
                                                </Button>
                                                <Button color="danger" type="button" /* onClick={() => dlgEliminar(etiqueta)} */>
                                                    <span className="fa-solid fa-xmark"></span>
                                                </Button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                <Modal
                    isOpen={this.state.modalQR}
                    toggle={this.toggleQR}
                >
                    <ModalHeader>
                        {this.props.descripcion}
                    </ModalHeader>
                    <ModalBody>
                        <p style={{ textAlign: 'center' }}>
                            <BakeryDatamatrix
                                scale={10}
                                foregroundColor={this.colorBlack}
                                backgroundColor={this.colorWhite}
                                text={this.state.qrValue}
                            />
                            <br />
                            {this.state.qrValue}
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" type="button" onClick={this.toggleQR}>
                            <span className="fa-solid fa-xmark"></span>
                            Cerrar
                        </Button>
                    </ModalFooter>
                </Modal>
            </Container>
        )
    }
}
export default MovimientosCargados