# Malawi Football Player Database — Product Description

**Working title:** Malawi Football Player Database

**One-line description:**
A structured, source-backed database of Malawian football players, their club affiliations, and their participation in club and national team match squads — built to make fragmented football data searchable, traceable, and reusable.

## Overview

The Malawi Football Player Database is a data product for recording and querying information about Malawian football players. It stores player identities, club histories, match records, and squad participation for both club and national team matches. The product is designed to solve the lack of centralized, reliable, and accessible player data by providing a maintainable schema, data-entry workflows, and interfaces for search, export, and integration.

It is not intended to be an authority on football matters, a live score service, or a scouting report. It is a database and access layer: a place where facts about players and their match involvement can be stored, linked, corrected, and retrieved. Coverage, inclusion criteria, and growth priorities are determined by the maintainers, not hard-coded into the product concept.

## Problem

Data on Malawian football players is scattered across PDFs, social media posts, club records, media reports, official registries, and personal knowledge. There is rarely one place to answer basic questions such as: Who played for this club? When? In which match? Was the player in the squad? Did they start? Did they play for the national team? Existing global databases cover only a small number of Malawian players and often omit domestic league, lower-tier, youth, or women's football data.

## Solution

A relational database with a small core set of entities and a clear path to extend them. The core entities are:

- **Player** — identity and basic biographical details.
- **Club** — team or club entity.
- **Player–Club affiliation** — who played for which club, when, and in what capacity.
- **Match** — the event that squads attach to.
- **Club match squad** — player participation in a club match.
- **National team match squad** — player participation in a national team match.

Every record can carry provenance fields such as source URL, source type, confidence level, and last verified date. This makes the database useful even when it is incomplete: users can see what is known, where it came from, and how reliable it is.

## Key capabilities

- Player profiles with identity, position, status, and basic bio data.
- Club registry with names, locations, and founding details.
- Affiliation history including permanent, loan, youth, and trial periods.
- Match records with date, competition, teams, score, and venue.
- Club match squads with lineups, substitutes, minutes, goals, assists, cards, and captaincy.
- National team match squads with the same participation detail.
- Source tracking and provenance for every fact where possible.
- Search and filter by player, club, match, competition, date, or squad role.
- Export to CSV or JSON.
- API access for developers, researchers, and media.
- Role-based editing, moderation, and audit logging.
- Bulk import and correction workflows.

## Intended users

- Sports journalists and media organisations.
- Researchers and data analysts.
- Fans and supporter communities.
- Scouts, agents, and clubs.
- National team staff and football administrators.
- Game developers and fantasy football platforms.
- Open-data contributors and developers.

## Product principles

- **Source-backed:** every fact should be traceable to a source.
- **Extensible:** the schema can accommodate new entity types, competitions, eras, and levels without redesign.
- **Open where possible:** data and code can be shared, exported, and reused.
- **Collaborative:** corrections and contributions are part of the workflow.
- **Non-authoritative:** it is a tool for recording and retrieving data, not the final word on football matters.
- **Sustainable:** designed for incremental growth and simple maintenance rather than one-time completeness.

## Product boundary

This is a database and access layer for Malawian football player data. It is not an official registration system, a live match tracker, a scouting evaluation platform, or a governing body. Its value comes from structure, traceability, and usability — not from claiming authority or completeness.

## Success statement

The product succeeds when users can reliably answer questions about Malawian football players' club and national team participation, trust the data because sources are cited, and expand coverage over time without needing to rebuild the core system.
