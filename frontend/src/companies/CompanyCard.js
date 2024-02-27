import React from "react";
import { Link } from "react-router-dom";
import {Card, CardTitle, CardBody, CardText, CardImg, Row, Col} from "reactstrap";

import "./CompanyCard.css";


/** Display basic information about a company. */
function CompanyCard({name, desc, logoUrl, handle}) {

    return (
        <div className="CompanyCard">
            <Card>
                <CardBody>
                    <Link to={`/companies/${handle}`}>
                        <Row>
                            <Col>
                                <CardTitle tag="h5">{name}</CardTitle>
                                <CardText>{desc}</CardText>
                            </Col>

                            <Col id="CompanyCard-img" className="col-2">
                                {logoUrl &&
                                    <CardImg
                                        tag="img"
                                        src={logoUrl}
                                        alt={name}
                                    />
                                }
                            </Col>
                        </Row>
                    </Link>
                </CardBody>
            </Card>
        </div>
    )
}


export default CompanyCard;
